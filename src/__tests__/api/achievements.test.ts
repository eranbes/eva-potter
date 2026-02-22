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

describe('checkAchievements', () => {
  let checkAchievements: typeof import('@/lib/achievements/checker').checkAchievements;

  beforeEach(async () => {
    const mod = await import('@/lib/achievements/checker');
    checkAchievements = mod.checkAchievements;
  });

  it('returns empty array for new user with no activity', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toEqual([]);
  });

  it('unlocks points_100 when user has 100+ points', async () => {
    seedUser(db, 'u1', 'Harry', 150);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('points_100');
  });

  it('unlocks points_500 and points_100 when user has 500+ points', async () => {
    seedUser(db, 'u1', 'Harry', 500);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('points_100');
    expect(newIds).toContain('points_500');
  });

  it('unlocks house_sorted when user has a house', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    await db.update(schema.users).set({ house: 'gryffindor' }).where(eq(schema.users.id, 'u1'));
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('house_sorted');
  });

  it('unlocks patronus_revealed when user has a patronus', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    await db.update(schema.users).set({ patronus: 'stag' }).where(eq(schema.users.id, 'u1'));
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('patronus_revealed');
  });

  it('unlocks first_quiz when user has answered a question', async () => {
    seedUser(db, 'u1', 'Harry', 10);
    db.insert(schema.userAnswers).values({
      userId: 'u1', questionId: 1, selectedOption: 'A', isCorrect: true, pointsAwarded: 10,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('first_quiz');
  });

  it('unlocks wordle_first_win when user has won a wordle', async () => {
    seedUser(db, 'u1', 'Harry', 60);
    db.insert(schema.wordleResults).values({
      userId: 'u1', word: 'HARRY', won: true, guessesUsed: 3, pointsAwarded: 40, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('wordle_first_win');
  });

  it('unlocks wordle_streak_3 with 3 consecutive wins', async () => {
    seedUser(db, 'u1', 'Harry', 120);
    for (let i = 0; i < 3; i++) {
      db.insert(schema.wordleResults).values({
        userId: 'u1', word: `WORD${i}`, won: true, guessesUsed: 3, pointsAwarded: 40,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('wordle_streak_3');
  });

  it('does not re-unlock already earned achievements', async () => {
    seedUser(db, 'u1', 'Harry', 200);
    const first = await checkAchievements('u1', db);
    expect(first).toContain('points_100');

    const second = await checkAchievements('u1', db);
    expect(second).not.toContain('points_100');
  });

  it('unlocks daily_first when user has daily completions', async () => {
    seedUser(db, 'u1', 'Harry', 20);
    db.insert(schema.dailyCompletions).values({
      userId: 'u1', dateKey: '2026-02-21', challengeType: 'quiz', pointsAwarded: 20, completedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('daily_first');
  });

  it('unlocks potions_first and master_brewer for fast potions', async () => {
    seedUser(db, 'u1', 'Harry', 80);
    db.insert(schema.potionsResults).values({
      userId: 'u1', timeSeconds: 25, pointsAwarded: 80, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('potions_first');
    expect(newIds).toContain('master_brewer');
  });

  it('unlocks duel_first for duel completion', async () => {
    seedUser(db, 'u1', 'Harry', 90);
    db.insert(schema.duelResults).values({
      userId: 'u1', roundsCorrect: 3, totalRounds: 5, pointsAwarded: 75, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('duel_first');
  });

  it('unlocks speed_demon_duel for perfect duel', async () => {
    seedUser(db, 'u1', 'Harry', 150);
    db.insert(schema.duelResults).values({
      userId: 'u1', roundsCorrect: 5, totalRounds: 5, pointsAwarded: 150, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('speed_demon_duel');
  });

  it('unlocks perfect_quiz when all answers are correct', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 1, difficulty: 'easy',
      questionsAnswered: 10, questionsCorrect: 10, pointsEarned: 100, completed: true,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('perfect_quiz');
  });

  it('does not unlock perfect_quiz when some answers are wrong', async () => {
    seedUser(db, 'u1', 'Harry', 80);
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 1, difficulty: 'easy',
      questionsAnswered: 10, questionsCorrect: 8, pointsEarned: 80, completed: true,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('perfect_quiz');
  });
});

describe('GET /api/achievements', () => {
  let GET: typeof import('@/app/api/achievements/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/achievements/route');
    GET = mod.GET;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns all achievements with unlocked status', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.achievements).toBeDefined();
    expect(Array.isArray(data.achievements)).toBe(true);
    expect(data.achievements.length).toBeGreaterThan(10);
    // None should be unlocked for a new user
    expect(data.achievements.every((a: any) => !a.unlocked)).toBe(true);
  });

  it('marks earned achievements as unlocked', async () => {
    seedUser(db, 'u1', 'Harry', 200);
    db.insert(schema.userAchievements).values({
      userId: 'u1', achievementId: 'points_100', unlockedAt: new Date().toISOString(),
    }).run();
    const res = await GET();
    const data = await res.json();
    const points100 = data.achievements.find((a: any) => a.id === 'points_100');
    expect(points100.unlocked).toBe(true);
  });
});
