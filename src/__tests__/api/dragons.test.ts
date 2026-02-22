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

describe('GET /api/dragons', () => {
  let GET: typeof import('@/app/api/dragons/route').GET;

  beforeEach(async () => {
    const mod = await import('@/app/api/dragons/route');
    GET = mod.GET;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns empty array for new user', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dragons).toEqual([]);
    expect(data.canBuy).toBe(false);
  });

  it('returns canBuy true if user has 5000+ points', async () => {
    seedUser(db, 'u1', 'Harry', 6000);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.canBuy).toBe(true);
  });

  it('returns dragon list after purchase', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const now = new Date().toISOString();
    db.insert(schema.userDragons).values({
      userId: 'u1',
      dragonType: 'common_welsh_green',
      obtainedAt: now,
    }).run();

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dragons).toHaveLength(1);
    expect(data.dragons[0].dragonType).toBe('common_welsh_green');
    expect(data.dragons[0].dragon).toBeDefined();
    expect(data.dragons[0].dragon.id).toBe('common_welsh_green');
  });
});

describe('POST /api/dragons', () => {
  let POST: typeof import('@/app/api/dragons/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/dragons/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 400 if user has < 5000 points', async () => {
    seedUser(db, 'u1', 'Harry', 4999);
    const res = await POST();
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('5000');
  });

  it('hatches a dragon for user with 5000+ points', async () => {
    seedUser(db, 'u1', 'Harry', 6000);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dragon).toBeDefined();
    expect(data.dragon.id).toBeDefined();
    expect(data.dragon.nameEn).toBeDefined();
    expect(data.dragon.emoji).toBeDefined();
    expect(data.dragon.rarity).toBeDefined();
  });

  it('deducts 5000 points', async () => {
    seedUser(db, 'u1', 'Harry', 7000);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.newTotal).toBe(2000);

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, 'u1'));
    expect(user.totalPoints).toBe(2000);
  });

  it('inserts a dragon row in DB', async () => {
    seedUser(db, 'u1', 'Harry', 5000);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();

    const rows = await db.select().from(schema.userDragons).where(eq(schema.userDragons.userId, 'u1'));
    expect(rows).toHaveLength(1);
    expect(rows[0].dragonType).toBe(data.dragon.id);
  });

  it('returns a valid dragon type', async () => {
    seedUser(db, 'u1', 'Harry', 5000);
    const res = await POST();
    const data = await res.json();
    const validTypes = ['common_welsh_green', 'swedish_short_snout', 'hungarian_horntail'];
    expect(validTypes).toContain(data.dragon.id);
  });

  it('allows multiple purchases', async () => {
    seedUser(db, 'u1', 'Harry', 15000);

    const res1 = await POST();
    expect(res1.status).toBe(200);

    const res2 = await POST();
    expect(res2.status).toBe(200);

    const rows = await db.select().from(schema.userDragons).where(eq(schema.userDragons.userId, 'u1'));
    expect(rows).toHaveLength(2);
  });

  it('unlocks dragon_tamer achievement on first hatch', async () => {
    seedUser(db, 'u1', 'Harry', 5000);
    const res = await POST();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.newAchievements).toContain('dragon_tamer');
  });

  it('does not re-unlock dragon_tamer on subsequent hatches', async () => {
    seedUser(db, 'u1', 'Harry', 15000);

    const res1 = await POST();
    const data1 = await res1.json();
    expect(data1.newAchievements).toContain('dragon_tamer');

    const res2 = await POST();
    const data2 = await res2.json();
    expect(data2.newAchievements).not.toContain('dragon_tamer');
  });
});

describe('dragon definitions', () => {
  it('has 3 dragons', async () => {
    const { dragons } = await import('@/lib/dragons/definitions');
    expect(dragons).toHaveLength(3);
  });

  it('weights sum to 100', async () => {
    const { dragons } = await import('@/lib/dragons/definitions');
    const total = dragons.reduce((sum, d) => sum + d.weight, 0);
    expect(total).toBe(100);
  });

  it('getRandomDragon returns a valid dragon', async () => {
    const { getRandomDragon, dragons } = await import('@/lib/dragons/definitions');
    const dragon = getRandomDragon();
    expect(dragons.map((d) => d.id)).toContain(dragon.id);
  });

  it('getDragonById finds existing dragon', async () => {
    const { getDragonById } = await import('@/lib/dragons/definitions');
    const dragon = getDragonById('hungarian_horntail');
    expect(dragon).toBeDefined();
    expect(dragon?.nameEn).toBe('Hungarian Horntail');
  });

  it('getDragonById returns undefined for invalid id', async () => {
    const { getDragonById } = await import('@/lib/dragons/definitions');
    expect(getDragonById('nonexistent')).toBeUndefined();
  });
});
