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
  return new Request('http://localhost:3000/api/duel/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/duel/complete', () => {
  let POST: typeof import('@/app/api/duel/complete/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/duel/complete/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST(postRequest({ roundsCorrect: 3, pointsAwarded: 75 }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid roundsCorrect', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ roundsCorrect: 7, pointsAwarded: 75 }) as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 for pointsAwarded > 150', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ roundsCorrect: 5, pointsAwarded: 200 }) as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative pointsAwarded', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ roundsCorrect: 3, pointsAwarded: -10 }) as any);
    expect(res.status).toBe(400);
  });

  it('records duel result and awards points', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    const res = await POST(postRequest({ roundsCorrect: 4, pointsAwarded: 100 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(100);
    expect(data.totalPoints).toBe(200);
  });

  it('saves to duel_results table', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    await POST(postRequest({ roundsCorrect: 3, pointsAwarded: 75 }) as any);
    const results = await db.select().from(schema.duelResults).where(eq(schema.duelResults.userId, 'u1'));
    expect(results.length).toBe(1);
    expect(results[0].roundsCorrect).toBe(3);
    expect(results[0].totalRounds).toBe(5);
    expect(results[0].pointsAwarded).toBe(75);
  });

  it('records 0-point duel', async () => {
    seedUser(db, 'u1', 'Harry', 50);
    const res = await POST(postRequest({ roundsCorrect: 0, pointsAwarded: 0 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.totalPoints).toBe(50);
  });

  it('allows max score of 150', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ roundsCorrect: 5, pointsAwarded: 150 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(150);
    expect(data.totalPoints).toBe(150);
  });
});

describe('spell definitions', () => {
  it('has at least 20 spells', async () => {
    const { spells } = await import('@/lib/duel/spells');
    expect(spells.length).toBeGreaterThanOrEqual(20);
  });

  it('each spell has correct structure', async () => {
    const { spells } = await import('@/lib/duel/spells');
    for (const spell of spells) {
      expect(spell.name).toBeDefined();
      expect(spell.effectEn).toBeDefined();
      expect(spell.effectFr).toBeDefined();
      expect(spell.wrongEffectsEn).toBeDefined();
      expect(spell.wrongEffectsEn.length).toBe(3);
      expect(spell.wrongEffectsFr).toBeDefined();
      expect(spell.wrongEffectsFr.length).toBe(3);
    }
  });
});
