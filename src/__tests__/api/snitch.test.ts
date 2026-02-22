import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

const mockModule = { db: null as any, schema: null as any };
vi.mock('@/db', () => mockModule);

import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

let db: ReturnType<typeof createTestDb>;

beforeEach(() => {
  db = createTestDb();
  mockModule.db = db;
  mockModule.schema = schema;
  logout();
});

/** Insert a snitch event directly. */
function seedSnitchEvent(
  status: string,
  activatesAt: string,
  opts: { expiresAt?: string; rewardPoints?: number; claimedByUserId?: string; claimedByName?: string; claimedAt?: string } = {},
) {
  const now = new Date().toISOString();
  db.insert(schema.snitchEvents)
    .values({
      status: status as any,
      rewardPoints: opts.rewardPoints ?? 400,
      activatesAt,
      expiresAt: opts.expiresAt ?? null,
      claimedByUserId: opts.claimedByUserId ?? null,
      claimedByName: opts.claimedByName ?? null,
      claimedAt: opts.claimedAt ?? null,
      createdAt: now,
    })
    .run();
}

function getRequest() {
  return new Request('http://localhost:3000/api/snitch/status', { method: 'GET' });
}

function postRequest(body: object) {
  return new Request('http://localhost:3000/api/snitch/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/snitch/status', () => {
  let GET: typeof import('@/app/api/snitch/status/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/snitch/status/route');
    GET = mod.GET;
  });

  it('returns active: false and auto-schedules when no events exist', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.active).toBe(false);

    // Should have auto-scheduled one event
    const events = await db.select().from(schema.snitchEvents);
    expect(events.length).toBe(1);
    expect(events[0].status).toBe('pending');
  });

  it('returns active: false for pending event not yet due', async () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    seedSnitchEvent('pending', future);

    const res = await GET();
    const data = await res.json();
    expect(data.active).toBe(false);
  });

  it('activates pending event when activatesAt <= now', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    seedSnitchEvent('pending', past, { rewardPoints: 350 });

    const res = await GET();
    const data = await res.json();
    expect(data.active).toBe(true);
    expect(data.eventId).toBe(1);
    expect(data.rewardPoints).toBe(350);
    expect(data.expiresAt).toBeDefined();

    // Verify DB updated to active
    const [event] = await db.select().from(schema.snitchEvents).where(eq(schema.snitchEvents.id, 1));
    expect(event.status).toBe('active');
  });

  it('returns active event info for already-active non-expired event', async () => {
    const past = new Date(Date.now() - 10000).toISOString();
    const futureExpiry = new Date(Date.now() + 30000).toISOString();
    seedSnitchEvent('active', past, { expiresAt: futureExpiry, rewardPoints: 450 });

    const res = await GET();
    const data = await res.json();
    expect(data.active).toBe(true);
    expect(data.eventId).toBe(1);
    expect(data.expiresAt).toBe(futureExpiry);
    expect(data.rewardPoints).toBe(450);
  });

  it('expires active event when expiresAt < now and schedules next', async () => {
    const past = new Date(Date.now() - 120000).toISOString();
    const pastExpiry = new Date(Date.now() - 1000).toISOString();
    seedSnitchEvent('active', past, { expiresAt: pastExpiry });

    const res = await GET();
    const data = await res.json();
    expect(data.active).toBe(false);
    expect(data.escaped).toBe(true);

    // Original event should be expired
    const [event] = await db.select().from(schema.snitchEvents).where(eq(schema.snitchEvents.id, 1));
    expect(event.status).toBe('expired');

    // Next event should be scheduled
    const events = await db.select().from(schema.snitchEvents);
    expect(events.length).toBe(2);
    expect(events[1].status).toBe('pending');
  });

  it('auto-scheduled event has valid structure', async () => {
    // Trigger auto-schedule by calling with no events
    await GET();

    const events = await db.select().from(schema.snitchEvents);
    expect(events.length).toBe(1);
    const event = events[0];
    expect(event.status).toBe('pending');
    expect(event.rewardPoints).toBeGreaterThanOrEqual(300);
    expect(event.rewardPoints).toBeLessThanOrEqual(500);
    expect(event.activatesAt).toBeDefined();
    expect(event.createdAt).toBeDefined();
  });
});

describe('POST /api/snitch/claim', () => {
  let POST: typeof import('@/app/api/snitch/claim/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/snitch/claim/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST(postRequest({ eventId: 1 }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 if missing eventId', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({}) as any);
    expect(res.status).toBe(400);
  });

  it('successfully claims active event and awards points', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    const past = new Date(Date.now() - 5000).toISOString();
    const futureExpiry = new Date(Date.now() + 30000).toISOString();
    seedSnitchEvent('active', past, { expiresAt: futureExpiry, rewardPoints: 400 });

    const res = await POST(postRequest({ eventId: 1 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.pointsAwarded).toBe(400);
    expect(data.winner.name).toBe('Harry');
    expect(data.newTotal).toBe(500);

    // Verify event is claimed in DB
    const [event] = await db.select().from(schema.snitchEvents).where(eq(schema.snitchEvents.id, 1));
    expect(event.status).toBe('claimed');
    expect(event.claimedByUserId).toBe('u1');

    // Should have scheduled next event
    const events = await db.select().from(schema.snitchEvents);
    expect(events.length).toBe(2);
    expect(events[1].status).toBe('pending');
  });

  it('fails on already-claimed event and returns winner info', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const past = new Date(Date.now() - 5000).toISOString();
    // Seed a second user so the FK is valid
    const now = new Date().toISOString();
    db.insert(schema.users).values({ id: 'u2', firstName: 'Hermione', pin: '', totalPoints: 0, createdAt: now, updatedAt: now }).run();

    seedSnitchEvent('claimed', past, {
      claimedByUserId: 'u2',
      claimedByName: 'Hermione',
      claimedAt: now,
      rewardPoints: 350,
    });

    const res = await POST(postRequest({ eventId: 1 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.winner.name).toBe('Hermione');
    expect(data.winner.points).toBe(350);
  });

  it('fails on expired/non-existent event', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const past = new Date(Date.now() - 120000).toISOString();
    seedSnitchEvent('expired', past);

    const res = await POST(postRequest({ eventId: 1 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.expired).toBe(true);
  });

  it('updates user totalPoints in DB after successful claim', async () => {
    seedUser(db, 'u1', 'Harry', 200);
    const past = new Date(Date.now() - 5000).toISOString();
    const futureExpiry = new Date(Date.now() + 30000).toISOString();
    seedSnitchEvent('active', past, { expiresAt: futureExpiry, rewardPoints: 300 });

    await POST(postRequest({ eventId: 1 }) as any);

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, 'u1'));
    expect(user.totalPoints).toBe(500);
  });
});
