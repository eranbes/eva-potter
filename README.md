# Eva Potter

A magical Harry Potter app built for kids. Test your knowledge across all 7 books, play a Wordle-style word guessing game, earn points, unlock new adventures, and climb the leaderboard.

![Welcome](public/screenshots/welcome.png)

## Features

- **All 7 Books** — Questions spanning the entire Harry Potter series
- **4 Difficulty Levels** — First-Years (easy), O.W.L.s (normal), N.E.W.T.s (hard), and Order of the Phoenix (expert)
- **280 Questions** — 10 per book per difficulty, with explanations
- **Magical Words (Wordle)** — Guess HP words (characters, spells, creatures, places, objects, potions) in up to 6 attempts with color feedback
- **120 Curated Words** — Variable length (4-8 letters) across 6 categories
- **Bilingual** — Full English and French support (questions, UI, book descriptions)
- **Name + PIN Login** — Kids pick a 4-digit PIN to save and resume their progress across sessions
- **Progressive Unlocking** — Earn points to unlock the next book
- **Goblet of Fortune** — Rare (~5%) luck-based mini-game between questions: bet points, pick a flame, win 3x or lose your bet
- **Points System** — Quiz: 10/20/30/40 by difficulty; Wordle: 60→10 by guesses used
- **Leaderboard** — Compare scores with other players
- **Progress Tracking** — See your stats and journey on the Hogwarts Express
- **Admin Reset** — Hidden admin page to wipe all user data for a fresh start (e.g. new school year)

| Bookshelf | Quiz | Wordle | Leaderboard |
|:-:|:-:|:-:|:-:|
| ![Bookshelf](public/screenshots/bookshelf.png) | ![Quiz](public/screenshots/quiz.png) | ![Wordle](public/screenshots/wordle.png) | ![Leaderboard](public/screenshots/leaderboard.png) |

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [SQLite](https://www.sqlite.org/) via better-sqlite3 + [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/)
- TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database (migrate + seed 280 questions)
npm run db:setup

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Run migrations only
npm run db:seed       # Seed only
npm run db:studio     # Open Drizzle Studio
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run build         # Production build
npm run start         # Start production server
```

## Docker

### Development

```bash
docker compose up
```

Live-reloads with your local source mounted.

### Production

```bash
# Standalone
docker compose -f docker-compose.production.yml up -d

# Or alongside other services (e.g. Taktikal)
docker compose -f docker-compose.prod.yml up -d
```

The production image uses a multi-stage build and ships with a pre-seeded database.

## Admin Reset

Navigate to `/admin/reset` to wipe all user data (users, progress, answers, wordle results). Books, questions, and game settings are kept intact.

- **Password**: Set via `ADMIN_PASSWORD` env var (default: `hogwarts`)
- **No link in the UI** — admin navigates directly by URL
- Useful for starting fresh with a new class of students each school year

## Project Structure

```
src/
├── app/                  # Next.js routes
│   ├── admin/reset/      # Admin reset page
│   ├── api/              # REST API (user, books, quiz, wordle, leaderboard, admin)
│   ├── books/            # Book selection → difficulty → quiz → results
│   ├── wordle/           # Wordle game page
│   ├── leaderboard/      # Leaderboard page
│   └── progress/         # Progress tracking page
├── components/
│   ├── bookshelf/        # Book display
│   ├── layout/           # Header, background
│   ├── providers/        # User and Language context
│   ├── quiz/             # Quiz flow components
│   ├── results/          # Score and review
│   ├── wordle/           # Wordle game components (board, keyboard, tiles, hints)
│   └── ui/               # Shared UI components
├── db/
│   ├── schema.ts         # Drizzle schema (users, books, questions, progress, answers, wordle)
│   ├── seed.ts           # 280 questions across 7 books × 4 difficulties
│   └── index.ts          # Database client
└── lib/
    ├── i18n/             # EN/FR translations and French question data
    └── wordle/           # Wordle engine (game logic) and 120-word list
```
