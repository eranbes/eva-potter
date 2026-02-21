import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

const mockModule = { db: null as any, schema: null as any };
vi.mock('@/db', () => mockModule);
vi.mock('@/lib/i18n/questions-fr', () => ({ questionsFr: {} }));
vi.mock('@/lib/i18n/books-fr', () => ({ booksFr: {} }));

import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

let db: ReturnType<typeof createTestDb>;

beforeEach(() => {
  db = createTestDb();
  mockModule.db = db;
  mockModule.schema = schema;
  logout();
});

describe('POST /api/quiz/reset', () => {
  let RESET_POST: typeof import('@/app/api/quiz/reset/route').POST;
  let ANSWER_POST: typeof import('@/app/api/quiz/answer/route').POST;

  beforeEach(async () => {
    const resetMod = await import('@/app/api/quiz/reset/route');
    RESET_POST = resetMod.POST;
    const answerMod = await import('@/app/api/quiz/answer/route');
    ANSWER_POST = answerMod.POST;
  });

  function postAnswer(questionId: number, selectedOption: string) {
    return ANSWER_POST(new Request('http://localhost:3000/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOption }),
    }) as any);
  }

  function postReset(bookSlug: string, difficulty: string) {
    return RESET_POST(new Request('http://localhost:3000/api/quiz/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookSlug, difficulty }),
    }) as any);
  }

  it('resets progress and deducts points', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Answer 3 questions correctly (30 points)
    await postAnswer(1, 'A');
    await postAnswer(2, 'A');
    await postAnswer(3, 'A');

    // Verify points before reset
    const [userBefore] = await db.select().from(schema.users).where(eq(schema.users.id, 'user-1'));
    expect(userBefore.totalPoints).toBe(30);

    // Reset
    const res = await postReset('philosophers-stone', 'easy');
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.pointsDeducted).toBe(30);
    expect(body.newTotalPoints).toBe(0);

    // Verify progress was deleted
    const progress = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, 'user-1'),
          eq(schema.userProgress.bookId, 1),
          eq(schema.userProgress.difficulty, 'easy')
        )
      );
    expect(progress).toHaveLength(0);

    // Verify answers were deleted
    const answers = await db.select().from(schema.userAnswers).where(eq(schema.userAnswers.userId, 'user-1'));
    expect(answers).toHaveLength(0);
  });

  it('returns success with 0 deducted when no progress exists', async () => {
    seedUser(db, 'user-1', 'Harry');

    const res = await postReset('philosophers-stone', 'easy');
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.pointsDeducted).toBe(0);
  });

  it('clamps points to 0 (never negative)', async () => {
    // User has 5 points but earned 10 from easy quiz — deducting 10 should clamp to 0
    seedUser(db, 'user-1', 'Harry', 5);

    // Manually insert progress with 10 points earned
    db.insert(schema.userProgress).values({
      userId: 'user-1',
      bookId: 1,
      difficulty: 'easy',
      questionsAnswered: 1,
      questionsCorrect: 1,
      pointsEarned: 10,
      completed: false,
    }).run();

    const res = await postReset('philosophers-stone', 'easy');
    const body = await res.json();

    expect(body.newTotalPoints).toBe(0);
  });
});
