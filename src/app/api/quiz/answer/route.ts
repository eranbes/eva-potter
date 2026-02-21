import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import { questionsFr } from '@/lib/i18n/questions-fr';
import { booksFr } from '@/lib/i18n/books-fr';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';

const DEFAULT_POINTS: Record<string, number> = {
  easy: 10,
  normal: 20,
  hard: 30,
  expert: 40,
};

async function getPointsForDifficulty(difficulty: string): Promise<number> {
  const key = `points_${difficulty}`;
  const [setting] = await db
    .select()
    .from(schema.gameSettings)
    .where(eq(schema.gameSettings.key, key));

  if (setting) {
    const parsed = parseInt(setting.value, 10);
    if (!isNaN(parsed)) return parsed;
  }

  return DEFAULT_POINTS[difficulty] ?? 10;
}

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
    const { questionId, selectedOption } = body;

    if (!questionId || typeof questionId !== 'number') {
      return NextResponse.json(
        { error: 'questionId is required and must be a number' },
        { status: 400 }
      );
    }

    if (!selectedOption || !['A', 'B', 'C', 'D'].includes(selectedOption)) {
      return NextResponse.json(
        { error: 'selectedOption must be A, B, C, or D' },
        { status: 400 }
      );
    }

    // Fetch the question with the correct answer
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

    const isCorrect = selectedOption === question.correctOption;
    const pointsPerCorrect = await getPointsForDifficulty(question.difficulty);

    // Check if user already answered this question
    const [existingAnswer] = await db
      .select()
      .from(schema.userAnswers)
      .where(
        and(
          eq(schema.userAnswers.userId, userId),
          eq(schema.userAnswers.questionId, questionId)
        )
      );

    let pointsAwarded = 0;

    if (existingAnswer) {
      // Already answered correctly -- don't allow re-answering
      if (existingAnswer.isCorrect) {
        return NextResponse.json(
          { error: 'You already answered this question correctly' },
          { status: 400 }
        );
      }

      // Previously wrong, now trying again
      if (isCorrect) {
        pointsAwarded = pointsPerCorrect;

        // Update existing answer
        await db
          .update(schema.userAnswers)
          .set({
            selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
            isCorrect: true,
            pointsAwarded,
          })
          .where(eq(schema.userAnswers.id, existingAnswer.id));

        // Update userProgress: increment questionsCorrect and pointsEarned
        const [progress] = await db
          .select()
          .from(schema.userProgress)
          .where(
            and(
              eq(schema.userProgress.userId, userId),
              eq(schema.userProgress.bookId, question.bookId),
              eq(schema.userProgress.difficulty, question.difficulty)
            )
          );

        if (progress) {
          await db
            .update(schema.userProgress)
            .set({
              questionsCorrect: progress.questionsCorrect + 1,
              pointsEarned: progress.pointsEarned + pointsAwarded,
            })
            .where(eq(schema.userProgress.id, progress.id));
        }

        // Update user totalPoints
        await db
          .update(schema.users)
          .set({
            totalPoints: user.totalPoints + pointsAwarded,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.users.id, userId));
      } else {
        // Previously wrong, still wrong -- update the selected option
        await db
          .update(schema.userAnswers)
          .set({
            selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
          })
          .where(eq(schema.userAnswers.id, existingAnswer.id));
      }
    } else {
      // New answer
      if (isCorrect) {
        pointsAwarded = pointsPerCorrect;
      }

      await db.insert(schema.userAnswers).values({
        userId,
        questionId,
        selectedOption: selectedOption as 'A' | 'B' | 'C' | 'D',
        isCorrect,
        pointsAwarded,
      });

      // Upsert userProgress
      const [progress] = await db
        .select()
        .from(schema.userProgress)
        .where(
          and(
            eq(schema.userProgress.userId, userId),
            eq(schema.userProgress.bookId, question.bookId),
            eq(schema.userProgress.difficulty, question.difficulty)
          )
        );

      if (progress) {
        const newAnswered = progress.questionsAnswered + 1;
        const newCorrect = progress.questionsCorrect + (isCorrect ? 1 : 0);
        const newPoints = progress.pointsEarned + pointsAwarded;
        const completed = newAnswered >= 10;

        await db
          .update(schema.userProgress)
          .set({
            questionsAnswered: newAnswered,
            questionsCorrect: newCorrect,
            pointsEarned: newPoints,
            completed,
          })
          .where(eq(schema.userProgress.id, progress.id));
      } else {
        const completed = 1 >= 10; // false for first question
        await db.insert(schema.userProgress).values({
          userId,
          bookId: question.bookId,
          difficulty: question.difficulty,
          questionsAnswered: 1,
          questionsCorrect: isCorrect ? 1 : 0,
          pointsEarned: pointsAwarded,
          completed,
        });
      }

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
    }

    // Recalculate total points for the response
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
      .map((book) => {
        let title = book.title;
        if (lang === 'fr') {
          const frBook = booksFr[book.slug];
          if (frBook) title = frBook.title;
        }
        return { bookId: book.id, title };
      });

    // Check if this quiz is now completed
    const [currentProgress] = await db
      .select()
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, userId),
          eq(schema.userProgress.bookId, question.bookId),
          eq(schema.userProgress.difficulty, question.difficulty)
        )
      );

    const quizCompleted = currentProgress?.completed ?? false;

    let explanation = question.explanation;
    if (lang === 'fr') {
      const key = `${question.bookId}-${question.difficulty}-${question.sortOrder}`;
      const fr = questionsFr[key];
      if (fr) {
        explanation = fr.explanation;
      }
    }

    // Check for new achievements
    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      correct: isCorrect,
      correctOption: question.correctOption,
      explanation,
      pointsAwarded,
      totalPoints: updatedUser.totalPoints,
      newUnlocks,
      quizCompleted,
      newAchievements,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
