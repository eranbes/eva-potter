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

function makeRequest(id: string) {
  return new Request(`http://localhost:3000/api/player/${id}`);
}

describe('GET /api/player/[id]', () => {
  let GET: typeof import('@/app/api/player/[id]/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/player/[id]/route');
    GET = mod.GET;
  });

  it('returns 404 for nonexistent user', async () => {
    const res = await GET(
      makeRequest('nonexistent'),
      { params: Promise.resolve({ id: 'nonexistent' }) }
    );
    expect(res.status).toBe(404);
  });

  it('returns user profile with basic info', async () => {
    seedUser(db, 'u1', 'Harry', 500);

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.id).toBe('u1');
    expect(data.user.firstName).toBe('Harry');
    expect(data.user.totalPoints).toBe(500);
    expect(data.user.createdAt).toBeDefined();
  });

  it('does not expose PIN', async () => {
    seedUser(db, 'u1', 'Harry', 0, '1234');

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.user).not.toHaveProperty('pin');
  });

  it('returns house when set', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    db.update(schema.users)
      .set({ house: 'gryffindor' })
      .where(eq(schema.users.id, 'u1'))
      .run();

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.user.house).toBe('gryffindor');
  });

  it('returns resolved patronus when set', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    db.update(schema.users)
      .set({ patronus: 'stag' })
      .where(eq(schema.users.id, 'u1'))
      .run();

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.user.patronus).toBeDefined();
    expect(data.user.patronus.id).toBe('stag');
    expect(data.user.patronus.nameEn).toBe('Stag');
    expect(data.user.patronus.emoji).toBeDefined();
  });

  it('returns null patronus when not set', async () => {
    seedUser(db, 'u1', 'Harry', 0);

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.user.patronus).toBeNull();
  });

  it('returns achievements with unlock status', async () => {
    seedUser(db, 'u1', 'Harry', 0);

    // Unlock one achievement
    db.insert(schema.userAchievements).values({
      userId: 'u1',
      achievementId: 'first_quiz',
      unlockedAt: new Date().toISOString(),
    }).run();

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();

    expect(data.achievements).toBeDefined();
    expect(data.achievements.length).toBeGreaterThan(0);

    const firstQuiz = data.achievements.find((a: any) => a.id === 'first_quiz');
    expect(firstQuiz.unlocked).toBe(true);
    expect(firstQuiz.unlockedAt).toBeDefined();

    const points100 = data.achievements.find((a: any) => a.id === 'points_100');
    expect(points100.unlocked).toBe(false);
    expect(points100.unlockedAt).toBeNull();
  });

  it('returns empty dragons for new user', async () => {
    seedUser(db, 'u1', 'Harry', 0);

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.dragons).toEqual([]);
  });

  it('returns dragons with resolved definitions', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const now = new Date().toISOString();
    db.insert(schema.userDragons).values({
      userId: 'u1',
      dragonType: 'common_welsh_green',
      obtainedAt: now,
    }).run();
    db.insert(schema.userDragons).values({
      userId: 'u1',
      dragonType: 'hungarian_horntail',
      obtainedAt: now,
    }).run();

    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();

    expect(data.dragons).toHaveLength(2);
    expect(data.dragons[0].dragonType).toBe('common_welsh_green');
    expect(data.dragons[0].dragon).toBeDefined();
    expect(data.dragons[0].dragon.id).toBe('common_welsh_green');
    expect(data.dragons[1].dragonType).toBe('hungarian_horntail');
    expect(data.dragons[1].dragon.id).toBe('hungarian_horntail');
  });

  it('only returns data for the requested user', async () => {
    seedUser(db, 'u1', 'Harry', 100);
    // Create a second user (don't log in as them)
    const now = new Date().toISOString();
    db.insert(schema.users).values({
      id: 'u2',
      firstName: 'Ron',
      pin: '',
      totalPoints: 200,
      createdAt: now,
      updatedAt: now,
    }).run();

    // Give u2 a dragon and an achievement
    db.insert(schema.userDragons).values({
      userId: 'u2',
      dragonType: 'common_welsh_green',
      obtainedAt: now,
    }).run();
    db.insert(schema.userAchievements).values({
      userId: 'u2',
      achievementId: 'first_quiz',
      unlockedAt: now,
    }).run();

    // Fetch u1's profile — should not have u2's data
    const res = await GET(
      makeRequest('u1'),
      { params: Promise.resolve({ id: 'u1' }) }
    );
    const data = await res.json();
    expect(data.user.firstName).toBe('Harry');
    expect(data.dragons).toEqual([]);
    const firstQuiz = data.achievements.find((a: any) => a.id === 'first_quiz');
    expect(firstQuiz.unlocked).toBe(false);
  });
});
