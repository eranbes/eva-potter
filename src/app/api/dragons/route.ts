import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getRandomDragon, getDragonById, DRAGON_EGG_COST } from '@/lib/dragons/definitions';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const userDragonRows = await db
      .select()
      .from(schema.userDragons)
      .where(eq(schema.userDragons.userId, userId));

    const dragons = userDragonRows.map((row) => ({
      ...row,
      dragon: getDragonById(row.dragonType),
    }));

    return NextResponse.json({
      dragons,
      canBuy: user.totalPoints >= DRAGON_EGG_COST,
    });
  } catch (error) {
    console.error('Error fetching dragons:', error);
    return NextResponse.json({ error: 'Failed to fetch dragons' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (user.totalPoints < DRAGON_EGG_COST) {
      return NextResponse.json(
        { error: `You need at least ${DRAGON_EGG_COST} points to buy a dragon egg` },
        { status: 400 }
      );
    }

    const dragon = getRandomDragon();
    const newTotal = user.totalPoints - DRAGON_EGG_COST;

    await db
      .update(schema.users)
      .set({ totalPoints: newTotal, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, userId));

    await db.insert(schema.userDragons).values({
      userId,
      dragonType: dragon.id,
      obtainedAt: new Date().toISOString(),
    });

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      dragon,
      newTotal,
      newAchievements,
    });
  } catch (error) {
    console.error('Error hatching dragon:', error);
    return NextResponse.json({ error: 'Failed to hatch dragon' }, { status: 500 });
  }
}
