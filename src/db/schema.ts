import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  totalPoints: integer('total_points').notNull().default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export const books = sqliteTable('books', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  coverImage: text('cover_image').notNull().default(''),
  sortOrder: integer('sort_order').notNull(),
  pointsToUnlock: integer('points_to_unlock').notNull().default(0),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id),
  difficulty: text('difficulty', { enum: ['easy', 'normal', 'hard'] }).notNull(),
  questionText: text('question_text').notNull(),
  optionA: text('option_a').notNull(),
  optionB: text('option_b').notNull(),
  optionC: text('option_c').notNull(),
  optionD: text('option_d').notNull(),
  correctOption: text('correct_option', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  explanation: text('explanation').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const userProgress = sqliteTable('user_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  bookId: integer('book_id').notNull().references(() => books.id),
  difficulty: text('difficulty', { enum: ['easy', 'normal', 'hard'] }).notNull(),
  questionsAnswered: integer('questions_answered').notNull().default(0),
  questionsCorrect: integer('questions_correct').notNull().default(0),
  pointsEarned: integer('points_earned').notNull().default(0),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
});

export const userAnswers = sqliteTable('user_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  questionId: integer('question_id').notNull().references(() => questions.id),
  selectedOption: text('selected_option', { enum: ['A', 'B', 'C', 'D'] }).notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  pointsAwarded: integer('points_awarded').notNull().default(0),
});

export const gameSettings = sqliteTable('game_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
