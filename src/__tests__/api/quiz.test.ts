import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

// Mock @/db to use our test database
const mockModule = { db: null as any, schema: null as any };
vi.mock('@/db', () => mockModule);

// Mock i18n modules (not needed for logic tests)
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

// Helper to create a NextRequest-like POST
function postRequest(body: object) {
  return new Request('http://localhost:3000/api/quiz/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/quiz/answer', () => {
  // Dynamically import so it uses our mocked @/db
  let POST: typeof import('@/app/api/quiz/answer/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/quiz/answer/route');
    POST = mod.POST;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing questionId', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ selectedOption: 'A' }) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('questionId');
  });

  it('returns 400 for invalid selectedOption', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'Z' }) as any);
    expect(res.status).toBe(400);
  });

  it('awards 10 points for a correct easy answer', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.correct).toBe(true);
    expect(body.pointsAwarded).toBe(10);
    expect(body.totalPoints).toBe(10);
  });

  it('awards 0 points for a wrong answer', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'B' }) as any);
    const body = await res.json();

    expect(body.correct).toBe(false);
    expect(body.pointsAwarded).toBe(0);
    expect(body.totalPoints).toBe(0);
  });

  it('allows re-answering a wrong answer correctly', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Answer wrong first
    await POST(postRequest({ questionId: 1, selectedOption: 'B' }) as any);

    // Re-answer correctly
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);
    const body = await res.json();

    expect(body.correct).toBe(true);
    expect(body.pointsAwarded).toBe(10);
    expect(body.totalPoints).toBe(10);
  });

  it('blocks re-answering a correct answer', async () => {
    seedUser(db, 'user-1', 'Harry');

    await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);
    const res = await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('already answered');
  });

  it('tracks progress across multiple answers', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Answer 3 questions: 2 correct, 1 wrong
    await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any); // correct
    await POST(postRequest({ questionId: 2, selectedOption: 'A' }) as any); // correct
    await POST(postRequest({ questionId: 3, selectedOption: 'B' }) as any); // wrong

    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, 'user-1'),
          eq(schema.userProgress.bookId, 1),
          eq(schema.userProgress.difficulty, 'easy')
        )
      );

    expect(progress.questionsAnswered).toBe(3);
    expect(progress.questionsCorrect).toBe(2);
    expect(progress.pointsEarned).toBe(20);
    expect(progress.completed).toBe(false);
  });

  it('marks quiz completed after 10 answers', async () => {
    seedUser(db, 'user-1', 'Harry');

    for (let i = 1; i <= 10; i++) {
      await POST(postRequest({ questionId: i, selectedOption: 'A' }) as any);
    }

    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, 'user-1'),
          eq(schema.userProgress.bookId, 1),
          eq(schema.userProgress.difficulty, 'easy')
        )
      );

    expect(progress.completed).toBe(true);
    expect(progress.pointsEarned).toBe(100);
  });

  it('awards 20 points for correct normal-difficulty answer', async () => {
    seedUser(db, 'user-1', 'Harry');

    // Normal questions start at id 11 (after 10 easy questions)
    const res = await POST(postRequest({ questionId: 11, selectedOption: 'B' }) as any);
    const body = await res.json();

    expect(body.correct).toBe(true);
    expect(body.pointsAwarded).toBe(20);
  });

  it('detects newly unlocked books', async () => {
    seedUser(db, 'user-1', 'Harry', 50); // start near the unlock threshold of 60

    const res = await POST(postRequest({ questionId: 1, selectedOption: 'A' }) as any);
    const body = await res.json();

    expect(body.totalPoints).toBe(60);
    expect(body.newUnlocks).toHaveLength(1);
    expect(body.newUnlocks[0].title).toBe('Chamber of Secrets');
  });
});
