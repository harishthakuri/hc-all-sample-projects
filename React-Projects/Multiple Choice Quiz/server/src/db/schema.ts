import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// Users & Authentication
// ============================================

/**
 * Users table - stores authenticated users
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' or 'admin'
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// ============================================
// Categories
// ============================================

/**
 * Categories table - stores quiz categories
 */
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  color: varchar('color', { length: 20 }), // Tailwind color class
  order: integer('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// Quizzes
// ============================================

/**
 * Quizzes table - stores quiz metadata
 */
export const quizzes = pgTable('quizzes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  difficulty: varchar('difficulty', { length: 20 }).default('medium').notNull(), // 'easy', 'medium', 'hard'
  timeLimit: integer('time_limit').default(420).notNull(), // 7 minutes in seconds
  passingScore: integer('passing_score').default(60).notNull(), // Percentage
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Questions table - stores quiz questions
 */
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  type: varchar('type', { length: 20 }).default('single').notNull(), // 'single' or 'multiple'
  explanation: text('explanation'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Options table - stores answer options for questions
 */
export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// Sessions & Attempts
// ============================================

/**
 * Sessions table - stores user sessions (anonymous or authenticated)
 */
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: varchar('session_token', { length: 64 }).unique().notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // Null for anonymous
  displayName: varchar('display_name', { length: 100 }), // For leaderboard (anonymous users)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

/**
 * Quiz attempts table - tracks user quiz attempts
 */
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  quizId: uuid('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }), // For leaderboard
  status: varchar('status', { length: 20 }).default('in_progress').notNull(), // 'in_progress', 'completed', 'abandoned'
  score: decimal('score', { precision: 5, scale: 2 }),
  timeTaken: integer('time_taken'), // Seconds taken to complete
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  currentQuestion: integer('current_question').default(0).notNull(),
});

/**
 * Attempt answers table - stores individual answers
 */
export const attemptAnswers = pgTable('attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .references(() => quizAttempts.id, { onDelete: 'cascade' })
    .notNull(),
  questionId: uuid('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  optionId: uuid('option_id').references(() => options.id, { onDelete: 'cascade' }),
  isCorrect: boolean('is_correct'),
  isFlagged: boolean('is_flagged').default(false).notNull(),
  answeredAt: timestamp('answered_at'),
});

// ============================================
// Analytics
// ============================================

/**
 * Quiz analytics table - aggregated stats
 */
export const quizAnalytics = pgTable('quiz_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  quizId: uuid('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  totalAttempts: integer('total_attempts').default(0).notNull(),
  totalCompletions: integer('total_completions').default(0).notNull(),
  averageScore: decimal('average_score', { precision: 5, scale: 2 }),
  averageTimeTaken: integer('average_time_taken'), // seconds
  highestScore: decimal('highest_score', { precision: 5, scale: 2 }),
  lowestScore: decimal('lowest_score', { precision: 5, scale: 2 }),
  passRate: decimal('pass_rate', { precision: 5, scale: 2 }),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  quizzes: many(quizzes),
  attempts: many(quizAttempts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  category: one(categories, {
    fields: [quizzes.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [quizzes.createdBy],
    references: [users.id],
  }),
  questions: many(questions),
  attempts: many(quizAttempts),
  analytics: one(quizAnalytics),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(options),
  attemptAnswers: many(attemptAnswers),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  attempts: many(quizAttempts),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  session: one(sessions, {
    fields: [quizAttempts.sessionId],
    references: [sessions.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  answers: many(attemptAnswers),
}));

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [attemptAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
  option: one(options, {
    fields: [attemptAnswers.optionId],
    references: [options.id],
  }),
}));

export const quizAnalyticsRelations = relations(quizAnalytics, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAnalytics.quizId],
    references: [quizzes.id],
  }),
}));

// ============================================
// Type exports
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;

export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type NewAttemptAnswer = typeof attemptAnswers.$inferInsert;

export type QuizAnalyticRecord = typeof quizAnalytics.$inferSelect;
export type NewQuizAnalyticRecord = typeof quizAnalytics.$inferInsert;
