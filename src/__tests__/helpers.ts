import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';
import { mockCookies } from './setup';

const COOKIE_NAME = 'eva_potter_user_id';

/** Create a fresh in-memory database with all tables and minimal seed data. */
export function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');

  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      pin TEXT NOT NULL DEFAULT '',
      total_points INTEGER NOT NULL DEFAULT 0,
      house TEXT,
      patronus TEXT,
      created_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE books (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL,
      points_to_unlock INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id),
      difficulty TEXT NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      book_id INTEGER NOT NULL REFERENCES books(id),
      difficulty TEXT NOT NULL,
      questions_answered INTEGER NOT NULL DEFAULT 0,
      questions_correct INTEGER NOT NULL DEFAULT 0,
      points_earned INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      question_id INTEGER NOT NULL REFERENCES questions(id),
      selected_option TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE game_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE wordle_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      word TEXT NOT NULL,
      won INTEGER NOT NULL,
      guesses_used INTEGER NOT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      played_at TEXT NOT NULL
    );
    CREATE TABLE user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      achievement_id TEXT NOT NULL,
      unlocked_at TEXT NOT NULL
    );
    CREATE TABLE daily_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      date_key TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE potions_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      time_seconds INTEGER NOT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      played_at TEXT NOT NULL
    );
    CREATE TABLE duel_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      rounds_correct INTEGER NOT NULL,
      total_rounds INTEGER NOT NULL DEFAULT 5,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      played_at TEXT NOT NULL
    );
    CREATE TABLE snitch_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL DEFAULT 'pending',
      reward_points INTEGER NOT NULL,
      activates_at TEXT NOT NULL,
      expires_at TEXT,
      claimed_by_user_id TEXT REFERENCES users(id),
      claimed_by_name TEXT,
      claimed_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Seed game settings
  sqlite.exec(`
    INSERT INTO game_settings (key, value) VALUES ('points_easy', '10');
    INSERT INTO game_settings (key, value) VALUES ('points_normal', '20');
    INSERT INTO game_settings (key, value) VALUES ('points_hard', '30');
    INSERT INTO game_settings (key, value) VALUES ('points_expert', '40');
    INSERT INTO game_settings (key, value) VALUES ('questions_per_level', '10');
  `);

  // Seed 2 books: book 1 free, book 2 requires 60 points
  sqlite.exec(`
    INSERT INTO books (id, title, slug, description, sort_order, points_to_unlock)
    VALUES (1, 'Philosopher''s Stone', 'philosophers-stone', 'Book 1', 1, 0);
    INSERT INTO books (id, title, slug, description, sort_order, points_to_unlock)
    VALUES (2, 'Chamber of Secrets', 'chamber-of-secrets', 'Book 2', 2, 60);
  `);

  // Seed 10 easy questions for book 1
  const insertQ = sqlite.prepare(`
    INSERT INTO questions (book_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 1; i <= 10; i++) {
    insertQ.run(1, 'easy', `Question ${i}?`, 'A answer', 'B answer', 'C answer', 'D answer', 'A', `Explanation ${i}`, i);
  }

  // Seed 10 normal questions for book 1
  for (let i = 1; i <= 10; i++) {
    insertQ.run(1, 'normal', `Normal Q${i}?`, 'A', 'B', 'C', 'D', 'B', `Normal explanation ${i}`, i);
  }

  // Seed 10 hard questions for book 1
  for (let i = 1; i <= 10; i++) {
    insertQ.run(1, 'hard', `Hard Q${i}?`, 'A', 'B', 'C', 'D', 'C', `Hard explanation ${i}`, i);
  }

  // Seed 10 expert questions for book 1
  for (let i = 1; i <= 10; i++) {
    insertQ.run(1, 'expert', `Expert Q${i}?`, 'A', 'B', 'C', 'D', 'D', `Expert explanation ${i}`, i);
  }

  return drizzle(sqlite, { schema });
}

/** Set the auth cookie so API routes see a logged-in user. */
export function loginAs(userId: string) {
  mockCookies.set(COOKIE_NAME, userId);
}

/** Clear all cookies. */
export function logout() {
  mockCookies.clear();
}

/** Seed a user directly in the database and set the auth cookie. */
export function seedUser(db: ReturnType<typeof createTestDb>, id: string, firstName: string, totalPoints = 0, pin = '') {
  const now = new Date().toISOString();
  db.insert(schema.users).values({ id, firstName, pin, totalPoints, createdAt: now, updatedAt: now }).run();
  loginAs(id);
  return id;
}
