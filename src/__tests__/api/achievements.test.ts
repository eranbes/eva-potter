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

  // --- Hard achievements ---

  it('unlocks points_2500 when user has 2500+ points', async () => {
    seedUser(db, 'u1', 'Harry', 2500);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('points_2500');
  });

  it('unlocks points_5000 when user has 5000+ points', async () => {
    seedUser(db, 'u1', 'Harry', 5000);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('points_5000');
    expect(newIds).toContain('points_2500');
  });

  it('does not unlock points_2500 when user has fewer points', async () => {
    seedUser(db, 'u1', 'Harry', 2000);
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('points_2500');
  });

  it('unlocks all_hard when all books have completed hard quizzes', async () => {
    seedUser(db, 'u1', 'Harry', 600);
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 1, difficulty: 'hard',
      questionsAnswered: 10, questionsCorrect: 8, pointsEarned: 300, completed: true,
    }).run();
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 2, difficulty: 'hard',
      questionsAnswered: 10, questionsCorrect: 7, pointsEarned: 300, completed: true,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('all_hard');
  });

  it('does not unlock all_hard when only some books completed', async () => {
    seedUser(db, 'u1', 'Harry', 300);
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 1, difficulty: 'hard',
      questionsAnswered: 10, questionsCorrect: 8, pointsEarned: 300, completed: true,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('all_hard');
  });

  it('unlocks all_expert when all books have completed expert quizzes', async () => {
    seedUser(db, 'u1', 'Harry', 800);
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 1, difficulty: 'expert',
      questionsAnswered: 10, questionsCorrect: 9, pointsEarned: 400, completed: true,
    }).run();
    db.insert(schema.userProgress).values({
      userId: 'u1', bookId: 2, difficulty: 'expert',
      questionsAnswered: 10, questionsCorrect: 8, pointsEarned: 400, completed: true,
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('all_expert');
  });

  it('unlocks perfectionist with 3 perfect quiz scores', async () => {
    seedUser(db, 'u1', 'Harry', 300);
    for (let i = 0; i < 3; i++) {
      db.insert(schema.userProgress).values({
        userId: 'u1', bookId: 1, difficulty: ['easy', 'normal', 'hard'][i],
        questionsAnswered: 10, questionsCorrect: 10, pointsEarned: 100, completed: true,
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('perfectionist');
  });

  it('does not unlock perfectionist with only 2 perfect scores', async () => {
    seedUser(db, 'u1', 'Harry', 200);
    for (let i = 0; i < 2; i++) {
      db.insert(schema.userProgress).values({
        userId: 'u1', bookId: 1, difficulty: ['easy', 'normal'][i],
        questionsAnswered: 10, questionsCorrect: 10, pointsEarned: 100, completed: true,
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('perfectionist');
  });

  it('unlocks wordle_streak_10 with 10 consecutive wins', async () => {
    seedUser(db, 'u1', 'Harry', 600);
    for (let i = 0; i < 10; i++) {
      db.insert(schema.wordleResults).values({
        userId: 'u1', word: `WORD${i}`, won: true, guessesUsed: 3, pointsAwarded: 40,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('wordle_streak_10');
  });

  it('does not unlock wordle_streak_10 when streak is broken', async () => {
    seedUser(db, 'u1', 'Harry', 400);
    for (let i = 0; i < 5; i++) {
      db.insert(schema.wordleResults).values({
        userId: 'u1', word: `WORD${i}`, won: true, guessesUsed: 3, pointsAwarded: 40,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    db.insert(schema.wordleResults).values({
      userId: 'u1', word: 'LOSE1', won: false, guessesUsed: 6, pointsAwarded: 0,
      playedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    }).run();
    for (let i = 6; i < 12; i++) {
      db.insert(schema.wordleResults).values({
        userId: 'u1', word: `WORD${i}`, won: true, guessesUsed: 3, pointsAwarded: 40,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('wordle_streak_10');
  });

  it('unlocks lightning_brewer for potions under 15 seconds', async () => {
    seedUser(db, 'u1', 'Harry', 80);
    db.insert(schema.potionsResults).values({
      userId: 'u1', timeSeconds: 12, pointsAwarded: 80, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('lightning_brewer');
    expect(newIds).toContain('master_brewer');
  });

  it('does not unlock lightning_brewer for potions over 15 seconds', async () => {
    seedUser(db, 'u1', 'Harry', 80);
    db.insert(schema.potionsResults).values({
      userId: 'u1', timeSeconds: 20, pointsAwarded: 80, playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('master_brewer');
    expect(newIds).not.toContain('lightning_brewer');
  });

  it('unlocks duel_master with 10 perfect duels', async () => {
    seedUser(db, 'u1', 'Harry', 1500);
    for (let i = 0; i < 10; i++) {
      db.insert(schema.duelResults).values({
        userId: 'u1', roundsCorrect: 5, totalRounds: 5, pointsAwarded: 150,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('duel_master');
  });

  it('does not unlock duel_master with fewer than 10 perfect duels', async () => {
    seedUser(db, 'u1', 'Harry', 1500);
    for (let i = 0; i < 9; i++) {
      db.insert(schema.duelResults).values({
        userId: 'u1', roundsCorrect: 5, totalRounds: 5, pointsAwarded: 150,
        playedAt: new Date(Date.now() - i * 60000).toISOString(),
      }).run();
    }
    // One imperfect duel
    db.insert(schema.duelResults).values({
      userId: 'u1', roundsCorrect: 3, totalRounds: 5, pointsAwarded: 75,
      playedAt: new Date().toISOString(),
    }).run();
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('duel_master');
  });

  it('unlocks daily_streak_7 with 7 consecutive days', async () => {
    seedUser(db, 'u1', 'Harry', 140);
    for (let i = 0; i < 7; i++) {
      const date = new Date(2026, 1, 15 + i); // Feb 15-21
      db.insert(schema.dailyCompletions).values({
        userId: 'u1', dateKey: date.toISOString().slice(0, 10), challengeType: 'quiz',
        pointsAwarded: 20, completedAt: date.toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('daily_streak_7');
  });

  it('does not unlock daily_streak_7 with a gap in days', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    // 3 consecutive days, then a gap, then 3 more
    for (let i = 0; i < 3; i++) {
      const date = new Date(2026, 1, 10 + i);
      db.insert(schema.dailyCompletions).values({
        userId: 'u1', dateKey: date.toISOString().slice(0, 10), challengeType: 'quiz',
        pointsAwarded: 20, completedAt: date.toISOString(),
      }).run();
    }
    for (let i = 0; i < 3; i++) {
      const date = new Date(2026, 1, 15 + i);
      db.insert(schema.dailyCompletions).values({
        userId: 'u1', dateKey: date.toISOString().slice(0, 10), challengeType: 'quiz',
        pointsAwarded: 20, completedAt: date.toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('daily_streak_7');
  });

  it('unlocks snitch_catcher with 3 caught snitches', async () => {
    seedUser(db, 'u1', 'Harry', 1200);
    for (let i = 0; i < 3; i++) {
      db.insert(schema.snitchEvents).values({
        status: 'claimed', rewardPoints: 400,
        activatesAt: new Date(Date.now() - i * 3600000).toISOString(),
        claimedByUserId: 'u1', claimedByName: 'Harry',
        claimedAt: new Date(Date.now() - i * 3600000).toISOString(),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).toContain('snitch_catcher');
  });

  it('does not unlock snitch_catcher with only 2 catches', async () => {
    seedUser(db, 'u1', 'Harry', 800);
    for (let i = 0; i < 2; i++) {
      db.insert(schema.snitchEvents).values({
        status: 'claimed', rewardPoints: 400,
        activatesAt: new Date(Date.now() - i * 3600000).toISOString(),
        claimedByUserId: 'u1', claimedByName: 'Harry',
        claimedAt: new Date(Date.now() - i * 3600000).toISOString(),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      }).run();
    }
    const newIds = await checkAchievements('u1', db);
    expect(newIds).not.toContain('snitch_catcher');
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
