# Multiple Choice Quiz Application

A modern, full-stack Multiple Choice Quiz application built with React, TypeScript, Hono, Drizzle ORM, and PostgreSQL.

## Features

- **Quiz Taking**: Take quizzes with single-choice and multi-select questions
- **Question Randomization**: Questions are shuffled on each attempt
- **Timer**: 7-minute countdown timer for each quiz
- **Progress Tracking**: Auto-save progress every 30 seconds
- **Session Management**: Anonymous session-based user tracking
- **Partial Scoring**: Multi-select questions support partial credit
- **Results Review**: Detailed breakdown of answers with explanations
- **Quiz History**: View past attempts and scores

## Tech Stack

| Layer            | Technology               |
| ---------------- | ------------------------ |
| Language         | TypeScript               |
| Frontend         | React 18 + Vite          |
| UI Components    | shadcn/ui + Tailwind CSS |
| State Management | Zustand                  |
| Backend          | Hono (Node.js)           |
| ORM              | Drizzle ORM              |
| Database         | PostgreSQL               |
| Package Manager  | pnpm                     |

## Project Structure

```
multiple-choice-quiz/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # shadcn UI components
│   │   │   ├── quiz/     # Quiz-specific components
│   │   │   └── layout/   # Layout components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── store/        # Zustand stores
│   │   └── lib/          # Utilities and API client
│   └── ...
├── server/                # Hono backend
│   ├── src/
│   │   ├── db/           # Database schema and migrations
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic
│   └── ...
├── shared/               # Shared TypeScript types
└── ...
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "Multiple Choice Quiz"

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables

Create `.env` file and configure your PostgreSQL credentials:

```env
DATABASE_HOST=10.10.10.5
DATABASE_PORT=5432
DATABASE_NAME=mcq-db
DATABASE_USER=db-user-name
DATABASE_PASSWORD=db-password
DATABASE_URL=postgresql://db-user-name:db-password@10.10.10.5:5432/mcq-db

PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001/api
SESSION_EXPIRY_DAYS=30
```

### 3. Set Up Database

```bash
# Generate database migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed sample data (optional)
pnpm --filter server db:seed
```

### 4. Start Development Servers

```bash
# Start both client and server concurrently
pnpm dev

# Or start individually:
pnpm dev:client  # Frontend at http://localhost:5173
pnpm dev:server  # Backend at http://localhost:3001
```

## Available Scripts

### Root Level

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm install`     | Install all dependencies     |
| `pnpm dev`         | Start both client and server |
| `pnpm dev:client`  | Start frontend only          |
| `pnpm dev:server`  | Start backend only           |
| `pnpm build`       | Build both client and server |
| `pnpm db:generate` | Generate Drizzle migrations  |
| `pnpm db:migrate`  | Run database migrations      |
| `pnpm db:push`     | Push schema to database      |
| `pnpm db:studio`   | Open Drizzle Studio          |

### Server Scripts

| Command                        | Description           |
| ------------------------------ | --------------------- |
| `pnpm --filter server db:seed` | Seed sample quiz data |

## API Endpoints

### Sessions

| Method | Endpoint                        | Description         |
| ------ | ------------------------------- | ------------------- |
| POST   | `/api/sessions`                 | Create new session  |
| GET    | `/api/sessions/:token`          | Validate session    |
| GET    | `/api/sessions/:token/attempts` | Get session history |

### Quizzes

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| GET    | `/api/quizzes`     | List all active quizzes |
| GET    | `/api/quizzes/:id` | Get quiz with questions |

### Attempts

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/attempts`             | Start new attempt        |
| GET    | `/api/attempts/:id`         | Get attempt (for resume) |
| PATCH  | `/api/attempts/:id`         | Save progress            |
| POST   | `/api/attempts/:id/submit`  | Submit quiz              |
| GET    | `/api/attempts/:id/results` | Get detailed results     |

## Database Schema

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     quizzes     │       │    questions    │       │     options     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ title           │   │   │ quiz_id (FK)    │   │   │ question_id(FK) │
│ description     │   └──>│ text            │   └──>│ text            │
│ time_limit      │       │ type            │       │ is_correct      │
│ is_active       │       │ explanation     │       │ order           │
│ created_at      │       │ order           │       └─────────────────┘
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    sessions     │       │   quiz_attempts │       │ attempt_answers │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │───┐   │ id (PK)         │
│ session_token   │   │   │ session_id (FK) │   │   │ attempt_id (FK) │
│ created_at      │   └──>│ quiz_id (FK)    │   └──>│ question_id(FK) │
│ last_active_at  │       │ status          │       │ option_id (FK)  │
│ expires_at      │       │ score           │       │ is_correct      │
└─────────────────┘       │ started_at      │       │ is_flagged      │
                          │ completed_at    │       │ answered_at     │
                          │ current_question│       └─────────────────┘
                          └─────────────────┘
```

## Key Features Implementation

### Question Randomization

Questions are shuffled using the Fisher-Yates algorithm when a quiz attempt starts:

```typescript
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### Partial Scoring

Multi-select questions use partial scoring:

```
Score = max(0, (correct_selections - incorrect_selections) / total_correct_options)
```

### Session Management

Anonymous sessions are created automatically and stored in localStorage. Sessions expire after 30 days by default.

## Development Notes

### Adding New UI Components

This project uses shadcn/ui. Components are in `client/src/components/ui/`.

### Database Migrations

After modifying the schema:

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

### Type Safety

Shared types are in the `shared/` package and used by both client and server, ensuring type consistency across the stack.

```bash
lsof -i :3001 2>/dev/null | head -5 || echo "No process on port 3001"
# COMMAND   PID        USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
# node    13327 username   22u  IPv6 0x284c8fee00753c4e      0t0  TCP *:redwood-broker (LISTEN)

kill -9 13327 2>/dev/null; pkill -f "tsx watch" 2>/dev/null; sleep 1

```

```bash

curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mcqquiz.com","password":"admin123"}'

```

##### Go to: http://localhost:5175/login

- Email: admin@mcqquiz.com
- Password: admin123
