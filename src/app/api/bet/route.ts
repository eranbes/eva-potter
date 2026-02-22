import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { amount, choice } = body;

    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    }

    if (![1, 2, 3].includes(choice)) {
      return NextResponse.json({ error: 'Choice must be 1, 2, or 3' }, { status: 400 });
    }

    if (amount > user.totalPoints) {
      return NextResponse.json({ error: 'Not enough points' }, { status: 400 });
    }

    // Server picks the winning position
    const winningPosition = Math.floor(Math.random() * 3) + 1;
    const won = choice === winningPosition;

    let pointsChange: number;
    let newTotal: number;

    if (won) {
      pointsChange = amount * 3;
      newTotal = user.totalPoints + pointsChange;
    } else {
      pointsChange = -amount;
      newTotal = Math.max(0, user.totalPoints - amount);
    }

    await db
      .update(schema.users)
      .set({ totalPoints: newTotal, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, userId));

    // Check for new achievements (goblet win + points-based)
    const newAchievements: string[] = [];
    if (won) {
      // Directly unlock goblet_winner since there's no bet_results table for the checker to query
      const [existingGoblet] = await db
        .select()
        .from(schema.userAchievements)
        .where(and(eq(schema.userAchievements.userId, userId), eq(schema.userAchievements.achievementId, 'goblet_winner')))
        .limit(1);
      if (!existingGoblet) {
        await db.insert(schema.userAchievements).values({
          userId,
          achievementId: 'goblet_winner',
          unlockedAt: new Date().toISOString(),
        });
        newAchievements.push('goblet_winner');
      }
      // Also check other achievements (e.g. points milestones)
      const others = await checkAchievements(userId, db);
      newAchievements.push(...others);
    }

    return NextResponse.json({
      won,
      winningPosition,
      pointsChange,
      newTotal,
      newAchievements,
    });
  } catch (error) {
    console.error('Error processing bet:', error);
    return NextResponse.json({ error: 'Failed to process bet' }, { status: 500 });
  }
}
