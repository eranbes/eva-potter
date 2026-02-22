import { NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { achievements } from '@/lib/achievements/definitions';
import { getPatronusById } from '@/lib/patronus/animals';
import { getDragonById } from '@/lib/dragons/definitions';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [user] = await db
      .select({
        id: schema.users.id,
        firstName: schema.users.firstName,
        totalPoints: schema.users.totalPoints,
        house: schema.users.house,
        patronus: schema.users.patronus,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Resolve patronus
    const patronus = user.patronus ? getPatronusById(user.patronus) ?? null : null;

    // Get user's unlocked achievements
    const unlocked = await db
      .select()
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, id));

    const unlockedMap = new Map(
      unlocked.map((u) => [u.achievementId, u.unlockedAt])
    );

    // Get user's dragons
    const userDragonRows = await db
      .select()
      .from(schema.userDragons)
      .where(eq(schema.userDragons.userId, id));

    const dragons = userDragonRows.map((row) => ({
      ...row,
      dragon: getDragonById(row.dragonType),
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        totalPoints: user.totalPoints,
        house: user.house,
        patronus,
        createdAt: user.createdAt,
      },
      achievements: achievements.map((a) => ({
        ...a,
        unlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) || null,
      })),
      dragons,
    });
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player profile' },
      { status: 500 }
    );
  }
}
