import { eq, asc, desc, like, and, or, sql } from 'drizzle-orm';
import { db, quizzes, questions, options, categories, users } from '../db';
import type { 
  CreateQuizRequest, 
  UpdateQuizRequest, 
  QuizSummary,
  QuizFilters,
  Quiz
} from 'shared';

/**
 * Create a new quiz with questions and options
 */
export async function createQuiz(
  data: CreateQuizRequest,
  createdBy?: string
): Promise<Quiz> {
  return await db.transaction(async (tx) => {
    // Create quiz
    const [quiz] = await tx
      .insert(quizzes)
      .values({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        createdBy,
      })
      .returning();

    // Create questions
    for (const q of data.questions) {
      const [question] = await tx
        .insert(questions)
        .values({
          quizId: quiz.id,
          text: q.text,
          type: q.type,
          explanation: q.explanation,
          order: q.order,
        })
        .returning();

      // Create options
      await tx.insert(options).values(
        q.options.map((opt) => ({
          questionId: question.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: opt.order,
        }))
      );
    }

    return quiz;
  });
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(data: UpdateQuizRequest): Promise<Quiz> {
  const { id, questions: newQuestions, ...quizData } = data;

  return await db.transaction(async (tx) => {
    // Update quiz metadata
    const [quiz] = await tx
      .update(quizzes)
      .set({
        ...quizData,
        updatedAt: new Date(),
      })
      .where(eq(quizzes.id, id))
      .returning();

    // If questions are provided, replace them
    if (newQuestions) {
      // Delete existing questions (cascade will handle options)
      await tx.delete(questions).where(eq(questions.quizId, id));

      // Create new questions
      for (const q of newQuestions) {
        const [question] = await tx
          .insert(questions)
          .values({
            quizId: id,
            text: q.text,
            type: q.type,
            explanation: q.explanation,
            order: q.order,
          })
          .returning();

        // Create options
        await tx.insert(options).values(
          q.options.map((opt) => ({
            questionId: question.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
            order: opt.order,
          }))
        );
      }
    }

    return quiz;
  });
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: string): Promise<void> {
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

/**
 * Get quiz by ID with all details (for admin editing)
 */
export async function getQuizForAdmin(id: string) {
  return await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: {
      questions: {
        with: { options: true },
        orderBy: [asc(questions.order)],
      },
      category: true,
    },
  });
}

/**
 * List all quizzes for admin (with filters)
 */
export async function listQuizzesForAdmin(
  filters: QuizFilters & { page?: number; pageSize?: number }
): Promise<{ quizzes: QuizSummary[]; total: number }> {
  const { categoryId, difficulty, search, isFeatured, sortBy, page = 1, pageSize = 20 } = filters;

  const conditions = [];

  if (categoryId) {
    conditions.push(eq(quizzes.categoryId, categoryId));
  }
  if (difficulty) {
    conditions.push(eq(quizzes.difficulty, difficulty));
  }
  if (isFeatured !== undefined) {
    conditions.push(eq(quizzes.isFeatured, isFeatured));
  }
  if (search) {
    conditions.push(
      or(
        like(quizzes.title, `%${search}%`),
        like(quizzes.description, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get order
  let orderBy;
  switch (sortBy) {
    case 'newest':
      orderBy = desc(quizzes.createdAt);
      break;
    case 'title':
      orderBy = asc(quizzes.title);
      break;
    default:
      orderBy = desc(quizzes.createdAt);
  }

  const offset = (page - 1) * pageSize;

  const results = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      categoryId: quizzes.categoryId,
      categoryName: categories.name,
      difficulty: quizzes.difficulty,
      timeLimit: quizzes.timeLimit,
      isActive: quizzes.isActive,
      isFeatured: quizzes.isFeatured,
      createdAt: quizzes.createdAt,
      questionCount: sql<number>`(
        SELECT count(*) FROM questions WHERE questions.quiz_id = quizzes.id
      )::int`,
    })
    .from(quizzes)
    .leftJoin(categories, eq(quizzes.categoryId, categories.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quizzes)
    .where(whereClause);

  const quizSummaries: QuizSummary[] = results.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    categoryId: q.categoryId,
    categoryName: q.categoryName,
    difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
    questionCount: q.questionCount,
    timeLimit: q.timeLimit,
    estimatedMinutes: Math.ceil(q.timeLimit / 60),
    isFeatured: q.isFeatured,
  }));

  return {
    quizzes: quizSummaries,
    total: countResult?.count || 0,
  };
}

/**
 * Toggle quiz active status
 */
export async function toggleQuizActive(id: string): Promise<Quiz> {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const [updated] = await db
    .update(quizzes)
    .set({ isActive: !quiz.isActive, updatedAt: new Date() })
    .where(eq(quizzes.id, id))
    .returning();

  return updated;
}

/**
 * Toggle quiz featured status
 */
export async function toggleQuizFeatured(id: string): Promise<Quiz> {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const [updated] = await db
    .update(quizzes)
    .set({ isFeatured: !quiz.isFeatured, updatedAt: new Date() })
    .where(eq(quizzes.id, id))
    .returning();

  return updated;
}

/**
 * List all users (admin only)
 */
export async function listUsers(
  page: number = 1,
  pageSize: number = 20
): Promise<{ users: any[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  return {
    users: userList,
    total: countResult?.count || 0,
  };
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<void> {
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Toggle user active status
 */
export async function toggleUserActive(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  await db
    .update(users)
    .set({ isActive: !user.isActive, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
