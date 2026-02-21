import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { calculateHouse } from '@/lib/sorting/calculate';
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
    const { answers } = body;

    if (
      !Array.isArray(answers) ||
      answers.length !== 4 ||
      !answers.every((a: unknown) => typeof a === 'number' && a >= 0 && a <= 3)
    ) {
      return NextResponse.json(
        { error: 'answers must be an array of 4 numbers (0-3)' },
        { status: 400 }
      );
    }

    const house = calculateHouse(answers);

    await db
      .update(schema.users)
      .set({ house, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({ house, newAchievements });
  } catch (error) {
    console.error('Error in sorting:', error);
    return NextResponse.json({ error: 'Failed to sort' }, { status: 500 });
  }
}
