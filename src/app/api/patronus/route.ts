import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { getPatronusById, getRandomPatronus } from '@/lib/patronus/animals';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';
const PATRONUS_THRESHOLD = 500;

export async function GET() {
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

    if (!user.patronus) {
      return NextResponse.json({ patronus: null });
    }

    const animal = getPatronusById(user.patronus);
    return NextResponse.json({ patronus: animal ?? null });
  } catch (error) {
    console.error('Error fetching patronus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patronus' },
      { status: 500 }
    );
  }
}

export async function POST() {
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

    if (user.patronus) {
      const existing = getPatronusById(user.patronus);
      return NextResponse.json(
        { error: 'Patronus already revealed', patronus: existing },
        { status: 400 }
      );
    }

    if (user.totalPoints < PATRONUS_THRESHOLD) {
      return NextResponse.json(
        { error: `You need at least ${PATRONUS_THRESHOLD} points to reveal your Patronus` },
        { status: 400 }
      );
    }

    const animal = getRandomPatronus();

    await db
      .update(schema.users)
      .set({
        patronus: animal.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({ patronus: animal, newAchievements });
  } catch (error) {
    console.error('Error revealing patronus:', error);
    return NextResponse.json(
      { error: 'Failed to reveal patronus' },
      { status: 500 }
    );
  }
}
