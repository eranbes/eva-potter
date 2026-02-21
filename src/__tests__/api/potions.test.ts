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

function postRequest(body: object) {
  return new Request('http://localhost:3000/api/potions/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/potions/complete', () => {
  let POST: typeof import('@/app/api/potions/complete/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/potions/complete/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST(postRequest({ timeSeconds: 45 }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid timeSeconds', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: -5 }) as any);
    expect(res.status).toBe(400);
  });

  it('awards 80 points for <30s completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: 25 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(80);
    expect(data.totalPoints).toBe(80);
  });

  it('awards 60 points for <60s completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: 45 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(60);
  });

  it('awards 40 points for <90s completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: 75 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(40);
  });

  it('awards 20 points for <120s completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: 100 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(20);
  });

  it('awards 10 points for 120s+ completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ timeSeconds: 180 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(10);
  });

  it('saves result to potions_results table', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    await POST(postRequest({ timeSeconds: 50 }) as any);
    const results = await db.select().from(schema.potionsResults).where(eq(schema.potionsResults.userId, 'u1'));
    expect(results.length).toBe(1);
    expect(results[0].timeSeconds).toBe(50);
    expect(results[0].pointsAwarded).toBe(60);
  });

  it('updates user totalPoints', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    await POST(postRequest({ timeSeconds: 50 }) as any);
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, 'u1'));
    expect(user.totalPoints).toBe(160);
  });
});

describe('potions ingredients', () => {
  it('has 12 ingredients', async () => {
    const { ingredients } = await import('@/lib/potions/ingredients');
    expect(ingredients.length).toBe(12);
  });

  it('each ingredient has required fields', async () => {
    const { ingredients } = await import('@/lib/potions/ingredients');
    for (const ing of ingredients) {
      expect(ing.id).toBeDefined();
      expect(ing.nameEn).toBeDefined();
      expect(ing.nameFr).toBeDefined();
      expect(ing.emoji).toBeDefined();
    }
  });
});
