import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

// Mock @/db to use our test database
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

// ── POST /api/wordle/complete ──────────────────────────────────────────────

function postRequest(body: object) {
  return new Request('http://localhost:3000/api/wordle/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/wordle/complete', () => {
  let POST: typeof import('@/app/api/wordle/complete/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/wordle/complete/route');
    POST = mod.POST;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 3 }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing word', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ won: true, guessesUsed: 3 }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('word');
  });

  it('returns 400 for invalid guessesUsed (0)', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 0 }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('guessesUsed');
  });

  it('returns 400 for invalid guessesUsed (7)', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 7 }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('guessesUsed');
  });

  it('returns 400 for invalid guessesUsed (non-number)', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 'abc' }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('guessesUsed');
  });

  it('awards 60 points for 1-guess win', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 1 }) as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.pointsAwarded).toBe(60);
    expect(body.totalPoints).toBe(60);
  });

  it('awards 50 points for 2-guess win', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 2 }) as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.pointsAwarded).toBe(50);
    expect(body.totalPoints).toBe(50);
  });

  it('awards 10 points for 6-guess win', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 6 }) as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.pointsAwarded).toBe(10);
    expect(body.totalPoints).toBe(10);
  });

  it('awards 0 points for a loss', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ word: 'HARRY', won: false, guessesUsed: 6 }) as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.pointsAwarded).toBe(0);
    expect(body.totalPoints).toBe(0);
  });

  it('updates user totalPoints correctly', async () => {
    seedUser(db, 'user-1', 'Harry', 25);

    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 3 }) as any);
    const body = await res.json();

    expect(body.pointsAwarded).toBe(40);
    expect(body.totalPoints).toBe(65);

    // Verify directly in the database
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, 'user-1'));

    expect(user.totalPoints).toBe(65);
  });

  it('detects newly unlocked books', async () => {
    seedUser(db, 'user-1', 'Harry', 50); // start near the unlock threshold of 60

    const res = await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 1 }) as any);
    const body = await res.json();

    expect(body.pointsAwarded).toBe(60);
    expect(body.totalPoints).toBe(110);
    expect(body.newUnlocks).toHaveLength(1);
    expect(body.newUnlocks[0].title).toBe('Chamber of Secrets');
  });

  it('records result in wordle_results table', async () => {
    seedUser(db, 'user-1', 'Harry');

    await POST(postRequest({ word: 'HARRY', won: true, guessesUsed: 4 }) as any);

    const results = await db
      .select()
      .from(schema.wordleResults)
      .where(eq(schema.wordleResults.userId, 'user-1'));

    expect(results).toHaveLength(1);
    expect(results[0].word).toBe('HARRY');
    expect(results[0].won).toBe(true);
    expect(results[0].guessesUsed).toBe(4);
    expect(results[0].pointsAwarded).toBe(30);
  });
});

// ── GET /api/wordle/stats ──────────────────────────────────────────────────

describe('GET /api/wordle/stats', () => {
  let GET: typeof import('@/app/api/wordle/stats/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/wordle/stats/route');
    GET = mod.GET;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns empty stats for user with no games', async () => {
    seedUser(db, 'user-1', 'Harry');

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.gamesPlayed).toBe(0);
    expect(body.gamesWon).toBe(0);
    expect(body.winPercentage).toBe(0);
    expect(body.currentStreak).toBe(0);
    expect(body.maxStreak).toBe(0);
    expect(body.guessDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    expect(body.totalPoints).toBe(0);
  });

  it('returns correct stats after multiple games', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Insert test data directly
    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'HARRY',
      won: true,
      guessesUsed: 3,
      pointsAwarded: 40,
      playedAt: '2026-02-20T10:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'MAGIC',
      won: false,
      guessesUsed: 6,
      pointsAwarded: 0,
      playedAt: '2026-02-20T11:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'SPELL',
      won: true,
      guessesUsed: 2,
      pointsAwarded: 50,
      playedAt: '2026-02-20T12:00:00.000Z',
    }).run();

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.gamesPlayed).toBe(3);
    expect(body.gamesWon).toBe(2);
    expect(body.totalPoints).toBe(90);
  });

  it('calculates win percentage correctly', async () => {
    seedUser(db, 'user-1', 'Harry');

    // 3 wins out of 4 games = 75%
    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'HARRY',
      won: true,
      guessesUsed: 3,
      pointsAwarded: 40,
      playedAt: '2026-02-20T10:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'MAGIC',
      won: true,
      guessesUsed: 4,
      pointsAwarded: 30,
      playedAt: '2026-02-20T11:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'SPELL',
      won: false,
      guessesUsed: 6,
      pointsAwarded: 0,
      playedAt: '2026-02-20T12:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'WANDS',
      won: true,
      guessesUsed: 1,
      pointsAwarded: 60,
      playedAt: '2026-02-20T13:00:00.000Z',
    }).run();

    const res = await GET();
    const body = await res.json();

    expect(body.winPercentage).toBe(75);
  });

  it('calculates guess distribution correctly (only wins)', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Two wins: one at 2 guesses, one at 4 guesses; one loss at 6 guesses (should not count)
    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'HARRY',
      won: true,
      guessesUsed: 2,
      pointsAwarded: 50,
      playedAt: '2026-02-20T10:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'MAGIC',
      won: true,
      guessesUsed: 4,
      pointsAwarded: 30,
      playedAt: '2026-02-20T11:00:00.000Z',
    }).run();

    db.insert(schema.wordleResults).values({
      userId: 'user-1',
      word: 'SPELL',
      won: false,
      guessesUsed: 6,
      pointsAwarded: 0,
      playedAt: '2026-02-20T12:00:00.000Z',
    }).run();

    const res = await GET();
    const body = await res.json();

    expect(body.guessDistribution).toEqual({
      1: 0,
      2: 1,
      3: 0,
      4: 1,
      5: 0,
      6: 0,
    });
  });
});
