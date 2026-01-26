import { eq, sql, desc, count } from 'drizzle-orm';
import { db, quizzes, questions, quizAttempts, attemptAnswers, users, quizAnalytics } from '../db';
import type { QuizAnalytics, DashboardStats, ScoreDistribution, QuestionAnalytics } from 'shared';

/**
 * Get analytics for a specific quiz
 */
export async function getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
    with: { questions: true },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Get attempt stats
  const [stats] = await db
    .select({
      totalAttempts: count(),
      totalCompletions: sql<number>`count(*) filter (where ${quizAttempts.status} = 'completed')::int`,
      averageScore: sql<number>`avg(${quizAttempts.score})::numeric(5,2)`,
      averageTimeTaken: sql<number>`avg(${quizAttempts.timeTaken})::int`,
      highestScore: sql<number>`max(${quizAttempts.score})::numeric(5,2)`,
      lowestScore: sql<number>`min(${quizAttempts.score}) filter (where ${quizAttempts.status} = 'completed')::numeric(5,2)`,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  // Calculate pass rate
  const [passStats] = await db
    .select({
      passed: sql<number>`count(*) filter (where ${quizAttempts.score} >= ${quiz.passingScore})::int`,
      total: sql<number>`count(*) filter (where ${quizAttempts.status} = 'completed')::int`,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  const passRate = passStats.total > 0 ? (passStats.passed / passStats.total) * 100 : 0;

  // Score distribution
  const scoreDistribution = await getScoreDistribution(quizId);

  // Question analytics
  const questionAnalytics = await getQuestionAnalytics(quizId);

  const completionRate = stats.totalAttempts > 0 
    ? (stats.totalCompletions / stats.totalAttempts) * 100 
    : 0;

  return {
    quizId,
    quizTitle: quiz.title,
    totalAttempts: stats.totalAttempts,
    totalCompletions: stats.totalCompletions,
    completionRate,
    averageScore: Number(stats.averageScore) || 0,
    averageTimeTaken: stats.averageTimeTaken || 0,
    highestScore: Number(stats.highestScore) || 0,
    lowestScore: Number(stats.lowestScore) || 0,
    passRate,
    scoreDistribution,
    questionAnalytics,
  };
}

/**
 * Get score distribution for a quiz
 */
async function getScoreDistribution(quizId: string): Promise<ScoreDistribution[]> {
  const ranges = [
    { min: 0, max: 20, label: '0-20%' },
    { min: 21, max: 40, label: '21-40%' },
    { min: 41, max: 60, label: '41-60%' },
    { min: 61, max: 80, label: '61-80%' },
    { min: 81, max: 100, label: '81-100%' },
  ];

  const [totalResult] = await db
    .select({ total: count() })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  const total = totalResult?.total || 0;

  const distribution: ScoreDistribution[] = [];

  for (const range of ranges) {
    const [result] = await db
      .select({ count: count() })
      .from(quizAttempts)
      .where(
        sql`${quizAttempts.quizId} = ${quizId} 
            AND ${quizAttempts.status} = 'completed'
            AND ${quizAttempts.score} >= ${range.min} 
            AND ${quizAttempts.score} <= ${range.max}`
      );

    distribution.push({
      range: range.label,
      count: result?.count || 0,
      percentage: total > 0 ? ((result?.count || 0) / total) * 100 : 0,
    });
  }

  return distribution;
}

/**
 * Get analytics for individual questions
 */
async function getQuestionAnalytics(quizId: string): Promise<QuestionAnalytics[]> {
  const quizQuestions = await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
    with: { options: true },
  });

  const analytics: QuestionAnalytics[] = [];

  for (const question of quizQuestions) {
    const [stats] = await db
      .select({
        totalAnswers: count(),
        correctAnswers: sql<number>`count(*) filter (where ${attemptAnswers.isCorrect} = true)::int`,
      })
      .from(attemptAnswers)
      .where(eq(attemptAnswers.questionId, question.id));

    const correctRate = stats.totalAnswers > 0 
      ? (stats.correctAnswers / stats.totalAnswers) * 100 
      : 0;

    // Find most selected option
    const [mostSelected] = await db
      .select({
        optionId: attemptAnswers.optionId,
        count: count(),
      })
      .from(attemptAnswers)
      .where(eq(attemptAnswers.questionId, question.id))
      .groupBy(attemptAnswers.optionId)
      .orderBy(desc(count()))
      .limit(1);

    const mostSelectedOption = question.options.find(
      (o) => o.id === mostSelected?.optionId
    );

    analytics.push({
      questionId: question.id,
      questionText: question.text,
      correctRate,
      averageTimeSpent: 0, // Would need per-question timing to calculate
      mostSelectedOption: mostSelectedOption?.text || 'N/A',
    });
  }

  return analytics;
}

/**
 * Get dashboard stats for admin
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [quizCount] = await db.select({ count: count() }).from(quizzes);
  const [questionCount] = await db.select({ count: count() }).from(questions);
  const [userCount] = await db.select({ count: count() }).from(users);
  const [attemptCount] = await db.select({ count: count() }).from(quizAttempts);
  const [activeQuizCount] = await db
    .select({ count: count() })
    .from(quizzes)
    .where(eq(quizzes.isActive, true));

  // Get recent activity
  const recentAttempts = await db
    .select({
      id: quizAttempts.id,
      completedAt: quizAttempts.completedAt,
      quizTitle: quizzes.title,
      userName: users.name,
      userId: users.id,
    })
    .from(quizAttempts)
    .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .leftJoin(users, eq(quizAttempts.userId, users.id))
    .where(eq(quizAttempts.status, 'completed'))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(5);

  const recentActivity = recentAttempts.map((a) => ({
    type: 'quiz_completed' as const,
    description: `${a.userName || 'Anonymous'} completed "${a.quizTitle}"`,
    timestamp: a.completedAt || new Date(),
    userId: a.userId || undefined,
    userName: a.userName || undefined,
  }));

  return {
    totalQuizzes: quizCount?.count || 0,
    totalQuestions: questionCount?.count || 0,
    totalUsers: userCount?.count || 0,
    totalAttempts: attemptCount?.count || 0,
    activeQuizzes: activeQuizCount?.count || 0,
    recentActivity,
  };
}

/**
 * Update quiz analytics (call after quiz completion)
 */
export async function updateQuizAnalytics(quizId: string): Promise<void> {
  const analytics = await getQuizAnalytics(quizId);

  await db
    .insert(quizAnalytics)
    .values({
      quizId,
      totalAttempts: analytics.totalAttempts,
      totalCompletions: analytics.totalCompletions,
      averageScore: analytics.averageScore.toString(),
      averageTimeTaken: analytics.averageTimeTaken,
      highestScore: analytics.highestScore.toString(),
      lowestScore: analytics.lowestScore.toString(),
      passRate: analytics.passRate.toString(),
      lastUpdated: new Date(),
    })
    .onConflictDoUpdate({
      target: quizAnalytics.quizId,
      set: {
        totalAttempts: analytics.totalAttempts,
        totalCompletions: analytics.totalCompletions,
        averageScore: analytics.averageScore.toString(),
        averageTimeTaken: analytics.averageTimeTaken,
        highestScore: analytics.highestScore.toString(),
        lowestScore: analytics.lowestScore.toString(),
        passRate: analytics.passRate.toString(),
        lastUpdated: new Date(),
      },
    });
}
