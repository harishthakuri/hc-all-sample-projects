import { eq, asc, and, like, or, desc, sql } from 'drizzle-orm';
import { db, quizzes, questions, options, categories } from '../db';
import type { QuizSummary, QuizWithQuestions, QuestionWithOptions, QuizFilters } from 'shared';

/**
 * Get all active quizzes with optional filters
 */
export async function listQuizzes(filters?: QuizFilters): Promise<QuizSummary[]> {
  const conditions = [eq(quizzes.isActive, true)];

  if (filters?.categoryId) {
    conditions.push(eq(quizzes.categoryId, filters.categoryId));
  }
  if (filters?.difficulty) {
    conditions.push(eq(quizzes.difficulty, filters.difficulty));
  }
  if (filters?.isFeatured) {
    conditions.push(eq(quizzes.isFeatured, true));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(quizzes.title, `%${filters.search}%`),
        like(quizzes.description, `%${filters.search}%`)
      )!
    );
  }

  // Determine sort order
  let orderBy;
  switch (filters?.sortBy) {
    case 'newest':
      orderBy = desc(quizzes.createdAt);
      break;
    case 'title':
      orderBy = asc(quizzes.title);
      break;
    case 'popular':
      // Would need to join with attempts and count
      orderBy = desc(quizzes.createdAt);
      break;
    default:
      orderBy = asc(quizzes.createdAt);
  }

  const allQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      categoryId: quizzes.categoryId,
      categoryName: categories.name,
      difficulty: quizzes.difficulty,
      timeLimit: quizzes.timeLimit,
      isFeatured: quizzes.isFeatured,
      questionCount: sql<number>`(
        SELECT count(*) FROM questions WHERE questions.quiz_id = quizzes.id
      )::int`,
    })
    .from(quizzes)
    .leftJoin(categories, eq(quizzes.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy);

  return allQuizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    categoryId: quiz.categoryId,
    categoryName: quiz.categoryName,
    difficulty: quiz.difficulty as 'easy' | 'medium' | 'hard',
    questionCount: quiz.questionCount,
    timeLimit: quiz.timeLimit,
    estimatedMinutes: Math.ceil(quiz.timeLimit / 60),
    isFeatured: quiz.isFeatured,
  }));
}

/**
 * Get featured quizzes
 */
export async function getFeaturedQuizzes(): Promise<QuizSummary[]> {
  return listQuizzes({ isFeatured: true });
}

/**
 * Get quizzes by category
 */
export async function getQuizzesByCategory(categoryId: string): Promise<QuizSummary[]> {
  return listQuizzes({ categoryId });
}

/**
 * Search quizzes
 */
export async function searchQuizzes(query: string): Promise<QuizSummary[]> {
  return listQuizzes({ search: query });
}

/**
 * Get quiz with questions for taking
 */
export async function getQuizForTaking(quizId: string): Promise<QuizWithQuestions | null> {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    with: {
      questions: {
        orderBy: [asc(questions.order)],
        with: {
          options: {
            orderBy: [asc(options.order)],
          },
        },
      },
    },
  });

  if (!quiz || !quiz.isActive) {
    return null;
  }

  const questionsWithOptions: QuestionWithOptions[] = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type as 'single' | 'multiple',
    order: q.order,
    options: q.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      order: opt.order,
    })),
  }));

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    timeLimit: quiz.timeLimit,
    questions: questionsWithOptions,
  };
}

/**
 * Get quiz by ID (for internal use)
 */
export async function getQuizById(quizId: string) {
  return db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    with: {
      questions: {
        with: {
          options: true,
        },
      },
    },
  });
}
