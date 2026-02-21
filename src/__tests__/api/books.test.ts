import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestDb, seedUser, logout } from '../helpers';

const mockModule = { db: null as any, schema: null as any };
vi.mock('@/db', () => mockModule);
vi.mock('@/lib/i18n/questions-fr', () => ({ questionsFr: {} }));
vi.mock('@/lib/i18n/books-fr', () => ({ booksFr: {} }));

import * as schema from '@/db/schema';

let db: ReturnType<typeof createTestDb>;

beforeEach(() => {
  db = createTestDb();
  mockModule.db = db;
  mockModule.schema = schema;
  logout();
});

describe('GET /api/books', () => {
  let GET: typeof import('@/app/api/books/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/books/route');
    GET = mod.GET;
  });

  it('returns 401 when not authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns books with unlock status', async () => {
    seedUser(db, 'user-1', 'Harry', 0);

    const res = await GET();
    const body = await res.json();

    expect(body.books).toHaveLength(2);
    expect(body.books[0].title).toBe("Philosopher's Stone");
    expect(body.books[0].unlocked).toBe(true);
    expect(body.books[1].title).toBe('Chamber of Secrets');
    expect(body.books[1].unlocked).toBe(false);
  });

  it('unlocks book 2 when user has enough points', async () => {
    seedUser(db, 'user-1', 'Harry', 60);

    const res = await GET();
    const body = await res.json();

    expect(body.books[1].unlocked).toBe(true);
  });
});

describe('GET /api/books/[bookId]/questions', () => {
  let GET: typeof import('@/app/api/books/[bookId]/questions/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/books/[bookId]/questions/route');
    GET = mod.GET;
  });

  function makeRequest(bookId: string, difficulty: string) {
    return new Request(`http://localhost:3000/api/books/${bookId}/questions?difficulty=${difficulty}`);
  }

  it('returns 401 when not authenticated', async () => {
    const res = await GET(
      makeRequest('1', 'easy') as any,
      { params: Promise.resolve({ bookId: '1' }) }
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid difficulty', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await GET(
      makeRequest('1', 'impossible') as any,
      { params: Promise.resolve({ bookId: '1' }) }
    );
    expect(res.status).toBe(400);
  });

  it('returns 403 for locked book', async () => {
    seedUser(db, 'user-1', 'Harry', 0);
    const res = await GET(
      makeRequest('2', 'easy') as any,
      { params: Promise.resolve({ bookId: '2' }) }
    );
    expect(res.status).toBe(403);
  });

  it('returns 10 questions without correct answers', async () => {
    seedUser(db, 'user-1', 'Harry');
    const res = await GET(
      makeRequest('1', 'easy') as any,
      { params: Promise.resolve({ bookId: '1' }) }
    );
    const body = await res.json();

    expect(body.questions).toHaveLength(10);
    // Should NOT expose correctOption
    expect(body.questions[0]).not.toHaveProperty('correctOption');
    expect(body.questions[0]).toHaveProperty('questionText');
    expect(body.questions[0]).toHaveProperty('optionA');
  });
});
