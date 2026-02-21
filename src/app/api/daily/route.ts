import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import { getDailyQuestionId, getDailyWordIndex, getTodayDateKey } from '@/lib/daily/seed';
import { WORD_LIST } from '@/lib/wordle/words';
import { questionsFr } from '@/lib/i18n/questions-fr';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET() {
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

    const today = new Date();
    const dateKey = getTodayDateKey();

    // Get total question count
    const [questionCount] = await db
      .select({ count: count() })
      .from(schema.questions);

    const totalQuestions = questionCount?.count ?? 0;

    // Get daily question
    let dailyQuestion = null;
    if (totalQuestions > 0) {
      const questionId = getDailyQuestionId(today, totalQuestions);
      const [q] = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.id, questionId));

      if (q) {
        // Apply French translations if needed
        let questionText = q.questionText;
        let optionA = q.optionA;
        let optionB = q.optionB;
        let optionC = q.optionC;
        let optionD = q.optionD;

        if (lang === 'fr') {
          const frKey = `${q.bookId}-${q.difficulty}-${q.sortOrder}`;
          const fr = questionsFr[frKey];
          if (fr) {
            questionText = fr.questionText;
            optionA = fr.optionA;
            optionB = fr.optionB;
            optionC = fr.optionC;
            optionD = fr.optionD;
          }
        }

        dailyQuestion = {
          id: q.id,
          bookId: q.bookId,
          difficulty: q.difficulty,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
        };
      }
    }

    // Get daily wordle word
    const wordIndex = getDailyWordIndex(today, WORD_LIST.length);
    const dailyWord = WORD_LIST[wordIndex];

    // Check completion status
    const completions = await db
      .select()
      .from(schema.dailyCompletions)
      .where(
        and(
          eq(schema.dailyCompletions.userId, userId),
          eq(schema.dailyCompletions.dateKey, dateKey)
        )
      );

    const quizCompleted = completions.some((c) => c.challengeType === 'quiz');
    const wordleCompleted = completions.some((c) => c.challengeType === 'wordle');

    return NextResponse.json({
      dateKey,
      dailyQuestion,
      dailyWord: {
        word: dailyWord.word,
        wordFr: dailyWord.wordFr,
        category: dailyWord.category,
        hintEn: dailyWord.hintEn,
        hintFr: dailyWord.hintFr,
      },
      quizCompleted,
      wordleCompleted,
    });
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily challenge' },
      { status: 500 }
    );
  }
}
