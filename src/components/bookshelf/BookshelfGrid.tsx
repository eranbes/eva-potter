'use client';

import { useRouter } from 'next/navigation';
import BookCard from './BookCard';

interface BookProgress {
  questionsAnswered: number;
  questionsCorrect: number;
  pointsEarned: number;
  completed: boolean;
}

interface Book {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  pointsToUnlock: number;
  unlocked: boolean;
  progress: {
    easy: BookProgress | null;
    normal: BookProgress | null;
    hard: BookProgress | null;
  };
}

interface BookshelfGridProps {
  books: Book[];
  className?: string;
}

export default function BookshelfGrid({ books, className = '' }: BookshelfGridProps) {
  const router = useRouter();

  return (
    <div
      className={`
        grid grid-cols-2 gap-3 sm:gap-4
        md:grid-cols-3
        lg:grid-cols-4
        ${className}
      `}
    >
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          description={book.description}
          unlocked={book.unlocked}
          pointsToUnlock={book.pointsToUnlock}
          userPoints={0}
          progress={book.progress}
          onClick={() => router.push(`/books/${book.slug}`)}
        />
      ))}
    </div>
  );
}
