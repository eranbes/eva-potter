/**
 * Deterministic daily selection using date as seed.
 * Generates the same question/word index for all users on a given day.
 */

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyQuestionId(date: Date, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const dateStr = formatDate(date);
  const hash = hashDate(dateStr + '-quiz');
  return (hash % totalQuestions) + 1; // question IDs are 1-indexed
}

export function getDailyWordIndex(date: Date, totalWords: number): number {
  if (totalWords <= 0) return 0;
  const dateStr = formatDate(date);
  const hash = hashDate(dateStr + '-wordle');
  return hash % totalWords;
}

export function getTodayDateKey(): string {
  return formatDate(new Date());
}
