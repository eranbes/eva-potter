import { eq, and, sql, desc } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';

type Database = BetterSQLite3Database<typeof schema>;

export async function checkAchievements(userId: string, database: Database): Promise<string[]> {
  // Get user's existing achievements
  const existing = await database
    .select({ achievementId: schema.userAchievements.achievementId })
    .from(schema.userAchievements)
    .where(eq(schema.userAchievements.userId, userId));

  const existingIds = new Set(existing.map((a) => a.achievementId));
  const newlyUnlocked: string[] = [];

  const unlock = async (id: string) => {
    if (existingIds.has(id)) return;
    await database.insert(schema.userAchievements).values({
      userId,
      achievementId: id,
      unlockedAt: new Date().toISOString(),
    });
    existingIds.add(id);
    newlyUnlocked.push(id);
  };

  // Get user data
  const [user] = await database
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId));

  if (!user) return [];

  // --- Points-based achievements ---
  if (user.totalPoints >= 100) await unlock('points_100');
  if (user.totalPoints >= 500) await unlock('points_500');
  if (user.totalPoints >= 1000) await unlock('points_1000');

  // --- House sorted ---
  if (user.house) await unlock('house_sorted');

  // --- Patronus revealed ---
  if (user.patronus) await unlock('patronus_revealed');

  // --- Quiz-based achievements ---
  const quizAnswers = await database
    .select({ count: sql<number>`count(*)` })
    .from(schema.userAnswers)
    .where(eq(schema.userAnswers.userId, userId));

  if (quizAnswers[0].count > 0) await unlock('first_quiz');

  // Perfect quiz (all correct)
  const perfectQuizzes = await database
    .select({
      bookId: schema.userProgress.bookId,
      difficulty: schema.userProgress.difficulty,
      questionsCorrect: schema.userProgress.questionsCorrect,
      questionsAnswered: schema.userProgress.questionsAnswered,
      completed: schema.userProgress.completed,
    })
    .from(schema.userProgress)
    .where(eq(schema.userProgress.userId, userId));

  const hasPerfect = perfectQuizzes.some(
    (p) => p.completed && p.questionsCorrect === p.questionsAnswered && p.questionsAnswered > 0
  );
  if (hasPerfect) await unlock('perfect_quiz');

  // All easy quizzes completed
  const allBooks = await database.select({ id: schema.books.id }).from(schema.books);
  const bookIds = allBooks.map((b) => b.id);

  if (bookIds.length > 0) {
    const completedEasy = perfectQuizzes.filter(
      (p) => p.difficulty === 'easy' && p.completed
    );
    const completedEasyBookIds = new Set(completedEasy.map((p) => p.bookId));
    if (bookIds.every((id) => completedEasyBookIds.has(id))) {
      await unlock('all_easy');
    }

    // All normal quizzes completed
    const completedNormal = perfectQuizzes.filter(
      (p) => p.difficulty === 'normal' && p.completed
    );
    const completedNormalBookIds = new Set(completedNormal.map((p) => p.bookId));
    if (bookIds.every((id) => completedNormalBookIds.has(id))) {
      await unlock('all_normal');
    }

    // Bookworm: quizzes from 5 different books
    const booksWithCompletedQuiz = new Set(
      perfectQuizzes.filter((p) => p.completed).map((p) => p.bookId)
    );
    if (booksWithCompletedQuiz.size >= 5) {
      await unlock('bookworm_5');
    }
  }

  // --- Wordle achievements ---
  const wordleResults = await database
    .select()
    .from(schema.wordleResults)
    .where(eq(schema.wordleResults.userId, userId))
    .orderBy(desc(schema.wordleResults.playedAt));

  const wordleWins = wordleResults.filter((r) => r.won);
  if (wordleWins.length > 0) await unlock('wordle_first_win');

  // Streak calculation (most recent consecutive wins)
  let streak = 0;
  for (const result of wordleResults) {
    if (result.won) {
      streak++;
    } else {
      break;
    }
  }
  if (streak >= 3) await unlock('wordle_streak_3');
  if (streak >= 5) await unlock('wordle_streak_5');

  // --- Daily challenge ---
  const dailyCount = await database
    .select({ count: sql<number>`count(*)` })
    .from(schema.dailyCompletions)
    .where(eq(schema.dailyCompletions.userId, userId));

  if (dailyCount[0].count > 0) await unlock('daily_first');

  // --- Potions ---
  const potionsResults = await database
    .select()
    .from(schema.potionsResults)
    .where(eq(schema.potionsResults.userId, userId));

  if (potionsResults.length > 0) await unlock('potions_first');

  const fastPotion = potionsResults.some((r) => r.timeSeconds <= 30);
  if (fastPotion) await unlock('master_brewer');

  // --- Duel ---
  const duelResultRows = await database
    .select()
    .from(schema.duelResults)
    .where(eq(schema.duelResults.userId, userId));

  if (duelResultRows.length > 0) await unlock('duel_first');

  const perfectDuel = duelResultRows.some(
    (r) => r.roundsCorrect === r.totalRounds
  );
  if (perfectDuel) await unlock('speed_demon_duel');

  return newlyUnlocked;
}
