import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and, inArray } from 'drizzle-orm';
import { questionsFr } from '@/lib/i18n/questions-fr';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
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

    const { bookId: bookIdStr } = await params;
    const bookId = parseInt(bookIdStr, 10);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid bookId' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');

    if (!difficulty || !['easy', 'normal', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'difficulty query parameter must be easy, normal, or hard' },
        { status: 400 }
      );
    }

    // Verify the book exists and is unlocked
    const [book] = await db
      .select()
      .from(schema.books)
      .where(eq(schema.books.id, bookId));

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    if (user.totalPoints < book.pointsToUnlock) {
      return NextResponse.json(
        { error: 'Book is locked. You need more points to unlock it.' },
        { status: 403 }
      );
    }

    // Fetch questions for this book/difficulty
    const questionRows = await db
      .select()
      .from(schema.questions)
      .where(
        and(
          eq(schema.questions.bookId, bookId),
          eq(schema.questions.difficulty, difficulty as 'easy' | 'normal' | 'hard')
        )
      )
      .orderBy(schema.questions.sortOrder)
      .limit(10);

    if (questionRows.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Fetch existing user answers for these questions
    const questionIds = questionRows.map((q) => q.id);
    const existingAnswers = await db
      .select()
      .from(schema.userAnswers)
      .where(
        and(
          eq(schema.userAnswers.userId, userId),
          inArray(schema.userAnswers.questionId, questionIds)
        )
      );

    const answerMap = new Map(
      existingAnswers.map((a) => [a.questionId, a])
    );

    // Return questions WITHOUT correctOption
    const questions = questionRows.map((q) => {
      const existing = answerMap.get(q.id);
      let questionText = q.questionText;
      let optionA = q.optionA;
      let optionB = q.optionB;
      let optionC = q.optionC;
      let optionD = q.optionD;
      if (lang === 'fr') {
        const key = `${q.bookId}-${q.difficulty}-${q.sortOrder}`;
        const fr = questionsFr[key];
        if (fr) {
          questionText = fr.questionText;
          optionA = fr.optionA;
          optionB = fr.optionB;
          optionC = fr.optionC;
          optionD = fr.optionD;
        }
      }
      return {
        id: q.id,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        sortOrder: q.sortOrder,
        alreadyAnswered: !!existing,
        previousAnswer: existing?.selectedOption ?? undefined,
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
