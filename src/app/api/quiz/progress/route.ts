import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const bookIdStr = searchParams.get('bookId');
    const difficulty = searchParams.get('difficulty');

    if (!bookIdStr) {
      return NextResponse.json(
        { error: 'bookId query parameter is required' },
        { status: 400 }
      );
    }

    const bookId = parseInt(bookIdStr, 10);
    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid bookId' },
        { status: 400 }
      );
    }

    if (!difficulty || !['easy', 'normal', 'hard', 'expert'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty query parameter must be easy, normal, hard, or expert' },
        { status: 400 }
      );
    }

    // Fetch userProgress for this book/difficulty
    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.bookId, bookId),
          eq(schema.userProgress.difficulty, difficulty as 'easy' | 'normal' | 'hard' | 'expert')
        )
      );

    // Fetch all questions for this book/difficulty to get their IDs
    const questionRows = await db
      .select({ id: schema.questions.id })
      .from(schema.questions)
      .where(
        and(
          eq(schema.questions.bookId, bookId),
          eq(schema.questions.difficulty, difficulty as 'easy' | 'normal' | 'hard' | 'expert')
        )
      );

    const questionIds = questionRows.map((q) => q.id);

    // Fetch all userAnswers for these questions
    let answeredQuestions: number[] = [];
    if (questionIds.length > 0) {
      const answers = await db
        .select({ questionId: schema.userAnswers.questionId })
        .from(schema.userAnswers)
        .where(
          and(
            eq(schema.userAnswers.userId, userId),
            inArray(schema.userAnswers.questionId, questionIds)
          )
        );
      answeredQuestions = answers.map((a) => a.questionId);
    }

    return NextResponse.json({
      progress: progress
        ? {
            questionsAnswered: progress.questionsAnswered,
            questionsCorrect: progress.questionsCorrect,
            pointsEarned: progress.pointsEarned,
            completed: progress.completed,
          }
        : {
            questionsAnswered: 0,
            questionsCorrect: 0,
            pointsEarned: 0,
            completed: false,
          },
      answeredQuestions,
    });
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz progress' },
      { status: 500 }
    );
  }
}
