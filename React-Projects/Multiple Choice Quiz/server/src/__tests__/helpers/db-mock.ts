import { vi } from "vitest";

/**
 * Mock database utilities for testing
 * Creates mock implementations of database operations based on the schema
 */

export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "user" | "admin";
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface MockSession {
  id: string;
  sessionToken: string;
  userId: string | null;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date | null;
}

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

export interface MockQuiz {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockQuestion {
  id: string;
  quizId: string;
  text: string;
  type: "single" | "multiple";
  explanation: string | null;
  order: number;
  createdAt: Date;
}

export interface MockOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface MockQuizAttempt {
  id: string;
  sessionId: string;
  userId: string | null;
  quizId: string;
  status: "in_progress" | "completed" | "abandoned";
  score: string | null;
  currentQuestion: number;
  timeTaken: number | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface MockAttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  optionId: string | null;
  isCorrect: boolean | null;
  isFlagged: boolean;
  answeredAt: Date | null;
}

/**
 * Creates a mock database with in-memory storage
 */
export function createMockDb() {
  const users: MockUser[] = [];
  const sessions: MockSession[] = [];
  const categories: MockCategory[] = [];
  const quizzes: MockQuiz[] = [];
  const questions: MockQuestion[] = [];
  const options: MockOption[] = [];
  const quizAttempts: MockQuizAttempt[] = [];
  const attemptAnswers: MockAttemptAnswer[] = [];

  return {
    // Mock query API (Drizzle-style)
    query: {
      users: {
        findFirst: vi.fn(async ({ where }: any) => {
          // Simple mock - in real scenarios, parse the where clause
          return users[0] || null;
        }),
      },
      sessions: {
        findFirst: vi.fn(async ({ where, with: relations }: any) => {
          const session = sessions[0] || null;
          if (session && relations?.user) {
            const user = users.find((u) => u.id === session.userId);
            return { ...session, user };
          }
          return session;
        }),
      },
      quizzes: {
        findFirst: vi.fn(async ({ where, with: relations }: any) => {
          const quiz = quizzes[0] || null;
          if (!quiz) return null;

          if (relations?.questions) {
            const quizQuestions = questions.filter((q) => q.quizId === quiz.id);
            const questionsWithOptions = quizQuestions.map((question) => {
              const questionOptions = options.filter(
                (o) => o.questionId === question.id,
              );
              return { ...question, options: questionOptions };
            });
            return { ...quiz, questions: questionsWithOptions };
          }
          return quiz;
        }),
      },
      quizAttempts: {
        findFirst: vi.fn(async ({ where, with: relations }: any) => {
          const attempt = quizAttempts[0] || null;
          if (!attempt) return null;

          if (relations?.answers) {
            const answers = attemptAnswers.filter(
              (a) => a.attemptId === attempt.id,
            );
            return { ...attempt, answers };
          }
          if (relations?.quiz) {
            const quiz = quizzes.find((q) => q.id === attempt.quizId);
            return { ...attempt, quiz };
          }
          return attempt;
        }),
      },
      categories: {
        findFirst: vi.fn(async () => categories[0] || null),
      },
    },

    // Mock insert operations
    insert: vi.fn((table: any) => ({
      values: vi.fn((data: any) => ({
        returning: vi.fn(async () => {
          const record = { id: `mock-id-${Date.now()}`, ...data };

          // Add to appropriate array based on table
          if (table === "users") users.push(record as MockUser);
          else if (table === "sessions") sessions.push(record as MockSession);
          else if (table === "quizzes") quizzes.push(record as MockQuiz);
          else if (table === "questions")
            questions.push(record as MockQuestion);
          else if (table === "options") options.push(record as MockOption);
          else if (table === "quizAttempts")
            quizAttempts.push(record as MockQuizAttempt);
          else if (table === "attemptAnswers") {
            if (Array.isArray(data)) {
              data.forEach((d) =>
                attemptAnswers.push({ id: `mock-id-${Date.now()}`, ...d }),
              );
            } else {
              attemptAnswers.push(record as MockAttemptAnswer);
            }
          }

          return [record];
        }),
      })),
    })),

    // Mock update operations
    update: vi.fn((table: any) => ({
      set: vi.fn((data: any) => ({
        where: vi.fn(() => ({
          returning: vi.fn(async () => {
            const updated = { id: "mock-id", ...data };
            return [updated];
          }),
        })),
      })),
    })),

    // Mock delete operations
    delete: vi.fn((table: any) => ({
      where: vi.fn(() => Promise.resolve()),
    })),

    // Mock select operations
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),

    // Direct access to data for test setup
    _testData: {
      users,
      sessions,
      categories,
      quizzes,
      questions,
      options,
      quizAttempts,
      attemptAnswers,
      reset: () => {
        users.length = 0;
        sessions.length = 0;
        categories.length = 0;
        quizzes.length = 0;
        questions.length = 0;
        options.length = 0;
        quizAttempts.length = 0;
        attemptAnswers.length = 0;
      },
    },
  };
}

export type MockDatabase = ReturnType<typeof createMockDb>;
