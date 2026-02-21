import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';

function calculatePoints(timeSeconds: number): number {
  if (timeSeconds < 30) return 80;
  if (timeSeconds < 60) return 60;
  if (timeSeconds < 90) return 40;
  if (timeSeconds < 120) return 20;
  return 10;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { timeSeconds } = body;

    if (typeof timeSeconds !== 'number' || timeSeconds < 0) {
      return NextResponse.json(
        { error: 'timeSeconds is required and must be a non-negative number' },
        { status: 400 }
      );
    }

    const pointsAwarded = calculatePoints(timeSeconds);

    await db.insert(schema.potionsResults).values({
      userId,
      timeSeconds: Math.round(timeSeconds),
      pointsAwarded,
      playedAt: new Date().toISOString(),
    });

    await db
      .update(schema.users)
      .set({
        totalPoints: user.totalPoints + pointsAwarded,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      pointsAwarded,
      totalPoints: updatedUser.totalPoints,
      newAchievements,
    });
  } catch (error) {
    console.error('Error completing potions:', error);
    return NextResponse.json(
      { error: 'Failed to record potions result' },
      { status: 500 }
    );
  }
}
