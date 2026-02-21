import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

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
    const { bookSlug, difficulty } = body;

    if (!bookSlug || typeof bookSlug !== 'string') {
      return NextResponse.json(
        { error: 'bookSlug is required' },
        { status: 400 }
      );
    }

    if (!difficulty || !['easy', 'normal', 'hard', 'expert'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty must be easy, normal, hard, or expert' },
        { status: 400 }
      );
    }

    // Look up book by slug
    const [book] = await db
      .select()
      .from(schema.books)
      .where(eq(schema.books.slug, bookSlug));

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Find userProgress for this user + book + difficulty
    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.bookId, book.id),
          eq(schema.userProgress.difficulty, difficulty as 'easy' | 'normal' | 'hard' | 'expert')
        )
      );

    if (!progress) {
      return NextResponse.json({
        success: true,
        pointsDeducted: 0,
        newTotalPoints: user.totalPoints,
      });
    }

    // Get all question IDs for this book + difficulty
    const questionRows = await db
      .select({ id: schema.questions.id })
      .from(schema.questions)
      .where(
        and(
          eq(schema.questions.bookId, book.id),
          eq(schema.questions.difficulty, difficulty as 'easy' | 'normal' | 'hard' | 'expert')
        )
      );

    const questionIds = questionRows.map((q) => q.id);

    // Delete all userAnswers for these question IDs + this user
    if (questionIds.length > 0) {
      await db
        .delete(schema.userAnswers)
        .where(
          and(
            eq(schema.userAnswers.userId, userId),
            inArray(schema.userAnswers.questionId, questionIds)
          )
        );
    }

    // Deduct points from user (clamped to 0)
    const pointsDeducted = progress.pointsEarned;
    const newTotalPoints = Math.max(0, user.totalPoints - pointsDeducted);

    await db
      .update(schema.users)
      .set({
        totalPoints: newTotalPoints,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    // Delete the userProgress record
    await db
      .delete(schema.userProgress)
      .where(eq(schema.userProgress.id, progress.id));

    return NextResponse.json({
      success: true,
      pointsDeducted,
      newTotalPoints,
    });
  } catch (error) {
    console.error('Error resetting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to reset quiz' },
      { status: 500 }
    );
  }
}
