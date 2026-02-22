import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { booksFr } from '@/lib/i18n/books-fr';

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

    const allBooks = await db
      .select()
      .from(schema.books)
      .orderBy(schema.books.sortOrder);

    const allProgress = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId));

    const difficulties = ['easy', 'normal', 'hard', 'expert'] as const;

    // Count questions per book/difficulty
    const questionCounts = await db
      .select({
        bookId: schema.questions.bookId,
        difficulty: schema.questions.difficulty,
        count: sql<number>`count(*)`,
      })
      .from(schema.questions)
      .groupBy(schema.questions.bookId, schema.questions.difficulty);

    const countMap = new Map<string, number>();
    for (const row of questionCounts) {
      countMap.set(`${row.bookId}-${row.difficulty}`, row.count);
    }

    const bookProgress = allBooks.map((book) => {
      const difficulties_data: Record<string, {
        questionsAnswered: number;
        questionsCorrect: number;
        pointsEarned: number;
        completed: boolean;
        totalQuestions: number;
      } | null> = {};

      for (const diff of difficulties) {
        const found = allProgress.find(
          (p) => p.bookId === book.id && p.difficulty === diff
        );
        const total = countMap.get(`${book.id}-${diff}`) ?? 0;
        difficulties_data[diff] = found
          ? {
              questionsAnswered: found.questionsAnswered,
              questionsCorrect: found.questionsCorrect,
              pointsEarned: found.pointsEarned,
              completed: found.questionsAnswered >= total,
              totalQuestions: total,
            }
          : null;
      }

      let title = book.title;
      if (lang === 'fr') {
        const frBook = booksFr[book.slug];
        if (frBook) title = frBook.title;
      }

      return {
        book: {
          id: book.id,
          title,
          slug: book.slug,
          sortOrder: book.sortOrder,
          pointsToUnlock: book.pointsToUnlock,
          unlocked: user.totalPoints >= book.pointsToUnlock,
        },
        difficulties: difficulties_data,
      };
    });

    return NextResponse.json({
      user: {
        firstName: user.firstName,
        totalPoints: user.totalPoints,
      },
      bookProgress,
    });
  } catch (error) {
    console.error('Error fetching overall progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
