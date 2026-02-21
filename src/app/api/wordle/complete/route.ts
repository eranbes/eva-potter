import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

const POINTS_BY_GUESSES: Record<number, number> = {
  1: 60,
  2: 50,
  3: 40,
  4: 30,
  5: 20,
  6: 10,
};

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
    const { word, won, guessesUsed } = body;

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'word is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof won !== 'boolean') {
      return NextResponse.json(
        { error: 'won is required and must be a boolean' },
        { status: 400 }
      );
    }

    if (typeof guessesUsed !== 'number' || guessesUsed < 1 || guessesUsed > 6) {
      return NextResponse.json(
        { error: 'guessesUsed is required and must be a number between 1 and 6' },
        { status: 400 }
      );
    }

    const pointsAwarded = won ? (POINTS_BY_GUESSES[guessesUsed] ?? 0) : 0;

    await db.insert(schema.wordleResults).values({
      userId,
      word,
      won,
      guessesUsed,
      pointsAwarded,
      playedAt: new Date().toISOString(),
    });

    // Update user totalPoints
    await db
      .update(schema.users)
      .set({
        totalPoints: user.totalPoints + pointsAwarded,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    // Re-fetch updated user to get new totalPoints
    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    // Check for newly unlocked books
    const allBooks = await db.select().from(schema.books);
    const newUnlocks = allBooks
      .filter(
        (book) =>
          book.pointsToUnlock > user.totalPoints &&
          book.pointsToUnlock <= updatedUser.totalPoints
      )
      .map((book) => ({ bookId: book.id, title: book.title }));

    return NextResponse.json({
      pointsAwarded,
      totalPoints: updatedUser.totalPoints,
      newUnlocks,
    });
  } catch (error) {
    console.error('Error completing wordle:', error);
    return NextResponse.json(
      { error: 'Failed to record wordle result' },
      { status: 500 }
    );
  }
}
