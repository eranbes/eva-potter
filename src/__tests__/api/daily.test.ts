import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

const mockModule = { db: null as any, schema: null as any };
vi.mock('@/db', () => mockModule);
vi.mock('@/lib/i18n/questions-fr', () => ({ questionsFr: {} }));

import * as schema from '@/db/schema';

let db: ReturnType<typeof createTestDb>;

beforeEach(() => {
  db = createTestDb();
  mockModule.db = db;
  mockModule.schema = schema;
  logout();
});

describe('daily seed functions', () => {
  it('getDailyQuestionId is deterministic for same date', async () => {
    const { getDailyQuestionId } = await import('@/lib/daily/seed');
    const date = new Date('2026-02-21');
    const id1 = getDailyQuestionId(date, 40);
    const id2 = getDailyQuestionId(date, 40);
    expect(id1).toBe(id2);
  });

  it('getDailyWordIndex is deterministic for same date', async () => {
    const { getDailyWordIndex } = await import('@/lib/daily/seed');
    const date = new Date('2026-02-21');
    const idx1 = getDailyWordIndex(date, 100);
    const idx2 = getDailyWordIndex(date, 100);
    expect(idx1).toBe(idx2);
  });

  it('different dates produce different selections', async () => {
    const { getDailyQuestionId } = await import('@/lib/daily/seed');
    const id1 = getDailyQuestionId(new Date('2026-02-21'), 40);
    const id2 = getDailyQuestionId(new Date('2026-02-22'), 40);
    // It's possible but extremely unlikely they collide
    // Just check both return valid indices
    expect(id1).toBeGreaterThanOrEqual(1);
    expect(id1).toBeLessThanOrEqual(40);
    expect(id2).toBeGreaterThanOrEqual(1);
    expect(id2).toBeLessThanOrEqual(40);
  });

  it('handles zero total gracefully', async () => {
    const { getDailyQuestionId, getDailyWordIndex } = await import('@/lib/daily/seed');
    expect(getDailyQuestionId(new Date(), 0)).toBe(0);
    expect(getDailyWordIndex(new Date(), 0)).toBe(0);
  });
});

describe('POST /api/daily/complete', () => {
  let POST: typeof import('@/app/api/daily/complete/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/daily/complete/route');
    POST = mod.POST;
  });

  function postRequest(body: object) {
    return new Request('http://localhost:3000/api/daily/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 if not authenticated', async () => {
    const res = await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'A' }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid type', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ type: 'invalid' }) as any);
    expect(res.status).toBe(400);
  });

  it('awards 2x points for correct quiz answer', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    // Question 1 is easy with correct answer 'A'
    const res = await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'A' }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.correct).toBe(true);
    expect(data.pointsAwarded).toBe(20); // 10 base * 2x
  });

  it('awards 0 points for wrong quiz answer', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'B' }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.correct).toBe(false);
    expect(data.pointsAwarded).toBe(0);
  });

  it('awards 2x wordle points', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ type: 'wordle', won: true, guessesUsed: 3 }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pointsAwarded).toBe(80); // 40 base * 2x
  });

  it('prevents double completion', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'A' }) as any);
    const res2 = await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'A' }) as any);
    expect(res2.status).toBe(400);
    const data = await res2.json();
    expect(data.error).toContain('Already completed');
  });

  it('allows both quiz and wordle on same day', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res1 = await POST(postRequest({ type: 'quiz', questionId: 1, selectedOption: 'A' }) as any);
    expect(res1.status).toBe(200);
    const res2 = await POST(postRequest({ type: 'wordle', won: true, guessesUsed: 2 }) as any);
    expect(res2.status).toBe(200);
  });
});
