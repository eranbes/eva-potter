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

describe('GET /api/patronus', () => {
  let GET: typeof import('@/app/api/patronus/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/patronus/route');
    GET = mod.GET;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns null patronus for user without one', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patronus).toBeNull();
  });

  it('returns patronus data for user with one', async () => {
    seedUser(db, 'u1', 'Harry', 600);
    await db.update(schema.users).set({ patronus: 'stag' }).where(eq(schema.users.id, 'u1'));
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patronus).toBeDefined();
    expect(data.patronus.id).toBe('stag');
    expect(data.patronus.nameEn).toBe('Stag');
  });
});

describe('POST /api/patronus', () => {
  let POST: typeof import('@/app/api/patronus/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/patronus/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 400 if user has < 500 points', async () => {
    seedUser(db, 'u1', 'Harry', 200);
    const res = await POST();
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('500');
  });

  it('reveals a valid patronus for user with 500+ points', async () => {
    seedUser(db, 'u1', 'Harry', 600);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.patronus).toBeDefined();
    expect(data.patronus.id).toBeDefined();
    expect(data.patronus.nameEn).toBeDefined();
    expect(data.patronus.emoji).toBeDefined();

    // Verify saved to DB
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, 'u1'));
    expect(user.patronus).toBe(data.patronus.id);
  });

  it('returns 400 if patronus already revealed', async () => {
    seedUser(db, 'u1', 'Harry', 600);
    await db.update(schema.users).set({ patronus: 'stag' }).where(eq(schema.users.id, 'u1'));
    const res = await POST();
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('already');
  });
});

describe('patronus animals', () => {
  it('has 20 animals', async () => {
    const { patronusAnimals } = await import('@/lib/patronus/animals');
    expect(patronusAnimals.length).toBe(20);
  });

  it('getPatronusById finds existing animal', async () => {
    const { getPatronusById } = await import('@/lib/patronus/animals');
    const stag = getPatronusById('stag');
    expect(stag).toBeDefined();
    expect(stag?.nameEn).toBe('Stag');
  });

  it('getPatronusById returns undefined for invalid id', async () => {
    const { getPatronusById } = await import('@/lib/patronus/animals');
    expect(getPatronusById('nonexistent')).toBeUndefined();
  });

  it('getRandomPatronus returns a valid animal', async () => {
    const { getRandomPatronus, patronusAnimals } = await import('@/lib/patronus/animals');
    const animal = getRandomPatronus();
    expect(patronusAnimals.map(a => a.id)).toContain(animal.id);
  });
});
