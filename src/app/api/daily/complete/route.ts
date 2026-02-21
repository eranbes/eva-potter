import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import { getTodayDateKey } from '@/lib/daily/seed';
import { questionsFr } from '@/lib/i18n/questions-fr';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';

const DEFAULT_POINTS: Record<string, number> = {
  easy: 10,
  normal: 20,
  hard: 30,
  expert: 40,
};

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
    const lang = cookieStore.get('eva_potter_language')?.value;

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
    const { type, questionId, selectedOption, won, guessesUsed } = body;

    if (!type || !['quiz', 'wordle'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "quiz" or "wordle"' },
        { status: 400 }
      );
    }

    const dateKey = getTodayDateKey();

    // Prevent double completion
    const [existing] = await db
      .select()
      .from(schema.dailyCompletions)
      .where(
        and(
          eq(schema.dailyCompletions.userId, userId),
          eq(schema.dailyCompletions.dateKey, dateKey),
          eq(schema.dailyCompletions.challengeType, type)
        )
      );

    if (existing) {
      return NextResponse.json(
        { error: 'Already completed this daily challenge today' },
        { status: 400 }
      );
    }

    let pointsAwarded = 0;
    let correct = false;
    let correctOption: string | undefined;
    let explanation: string | undefined;

    if (type === 'quiz') {
      if (!questionId || typeof questionId !== 'number') {
        return NextResponse.json(
          { error: 'questionId is required for quiz' },
          { status: 400 }
        );
      }

      if (!selectedOption || !['A', 'B', 'C', 'D'].includes(selectedOption)) {
        return NextResponse.json(
          { error: 'selectedOption must be A, B, C, or D' },
          { status: 400 }
        );
      }

      const [question] = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.id, questionId));

      if (!question) {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        );
      }

      correct = selectedOption === question.correctOption;
      correctOption = question.correctOption;

      // Get explanation (with FR translation if applicable)
      explanation = question.explanation;
      if (lang === 'fr') {
        const frKey = `${question.bookId}-${question.difficulty}-${question.sortOrder}`;
        const fr = questionsFr[frKey];
        if (fr) {
          explanation = fr.explanation;
        }
      }

      if (correct) {
        const basePoints = DEFAULT_POINTS[question.difficulty] ?? 10;
        pointsAwarded = basePoints * 2; // 2x bonus for daily
      }
    } else {
      // wordle
      if (typeof won !== 'boolean') {
        return NextResponse.json(
          { error: 'won is required for wordle' },
          { status: 400 }
        );
      }

      if (typeof guessesUsed !== 'number' || guessesUsed < 1 || guessesUsed > 6) {
        return NextResponse.json(
          { error: 'guessesUsed must be a number between 1 and 6' },
          { status: 400 }
        );
      }

      if (won) {
        const basePoints = POINTS_BY_GUESSES[guessesUsed] ?? 0;
        pointsAwarded = basePoints * 2; // 2x bonus for daily
      }
    }

    // Record completion
    await db.insert(schema.dailyCompletions).values({
      userId,
      dateKey,
      challengeType: type as 'quiz' | 'wordle',
      pointsAwarded,
      completedAt: new Date().toISOString(),
    });

    // Update user totalPoints
    if (pointsAwarded > 0) {
      await db
        .update(schema.users)
        .set({
          totalPoints: user.totalPoints + pointsAwarded,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, userId));
    }

    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      type,
      correct,
      correctOption,
      explanation,
      pointsAwarded,
      totalPoints: updatedUser.totalPoints,
      newAchievements,
    });
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    return NextResponse.json(
      { error: 'Failed to complete daily challenge' },
      { status: 500 }
    );
  }
}
