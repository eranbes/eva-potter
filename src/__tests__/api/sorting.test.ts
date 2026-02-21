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

function postRequest(body: object) {
  return new Request('http://localhost:3000/api/sorting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sorting', () => {
  let POST: typeof import('@/app/api/sorting/route').POST;

  beforeEach(async () => {
    const mod = await import('@/app/api/sorting/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    const res = await POST(postRequest({ answers: [0, 0, 0, 0] }) as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 if answers is not an array of 4', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ answers: [0, 0] }) as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 if answers contain invalid values', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ answers: [0, 0, 5, 0] }) as any);
    expect(res.status).toBe(400);
  });

  it('sorts user into a valid house and saves to DB', async () => {
    seedUser(db, 'u1', 'Harry', 0);
    const res = await POST(postRequest({ answers: [0, 0, 0, 0] }) as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff']).toContain(data.house);

    // Verify saved in DB
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, 'u1'));
    expect(user.house).toBe(data.house);
  });

  it('all-gryffindor answers tend toward gryffindor', async () => {
    // Answers [0,0,0,0] give max gryffindor weight (12)
    // Run multiple times to account for random bonus
    const houses: string[] = [];
    for (let i = 0; i < 20; i++) {
      const testDb = createTestDb();
      mockModule.db = testDb;
      const now = new Date().toISOString();
      testDb.insert(schema.users).values({ id: `u-${i}`, firstName: 'Test', pin: '1234', totalPoints: 0, createdAt: now, updatedAt: now }).run();
      const { loginAs } = await import('../helpers');
      loginAs(`u-${i}`);
      const res = await POST(postRequest({ answers: [0, 0, 0, 0] }) as any);
      const data = await res.json();
      houses.push(data.house);
    }
    // Majority should be gryffindor
    const gryffindorCount = houses.filter(h => h === 'gryffindor').length;
    expect(gryffindorCount).toBeGreaterThan(10);
  });
});

describe('calculateHouse', () => {
  it('returns a valid house string', async () => {
    const { calculateHouse } = await import('@/lib/sorting/calculate');
    const house = calculateHouse([0, 0, 0, 0]);
    expect(['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff']).toContain(house);
  });

  it('handles out-of-range answers gracefully', async () => {
    const { calculateHouse } = await import('@/lib/sorting/calculate');
    // Should not crash
    const house = calculateHouse([-1, 5, 0, 0]);
    expect(['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff']).toContain(house);
  });
});
