import { eq, desc, sql, and } from 'drizzle-orm';
import { db, quizAttempts, quizzes, sessions, users } from '../db';
import type { QuizLeaderboard, LeaderboardEntry, GlobalLeaderboard, GlobalLeaderboardEntry } from 'shared';

/**
 * Get leaderboard for a specific quiz
 */
export async function getQuizLeaderboard(
  quizId: string,
  limit: number = 10
): Promise<QuizLeaderboard> {
  const quiz = await db.query.quizzes.findFirst({
    where: eq(quizzes.id, quizId),
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const results = await db
    .select({
      sessionId: quizAttempts.sessionId,
      userId: quizAttempts.userId,
      score: quizAttempts.score,
      timeTaken: quizAttempts.timeTaken,
      completedAt: quizAttempts.completedAt,
      userName: sql<string>`COALESCE(${users.name}, ${sessions.displayName}, 'Anonymous')`,
      avatarUrl: users.avatarUrl,
    })
    .from(quizAttempts)
    .leftJoin(sessions, eq(quizAttempts.sessionId, sessions.id))
    .leftJoin(users, eq(quizAttempts.userId, users.id))
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.status, 'completed')
      )
    )
    .orderBy(desc(quizAttempts.score), quizAttempts.timeTaken)
    .limit(limit);

  const entries: LeaderboardEntry[] = results.map((r, index) => ({
    rank: index + 1,
    sessionId: r.sessionId,
    userId: r.userId,
    userName: r.userName,
    avatarUrl: r.avatarUrl,
    score: Number(r.score) || 0,
    timeTaken: r.timeTaken || 0,
    completedAt: r.completedAt || new Date(),
  }));

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.status, 'completed')
      )
    );

  return {
    quizId,
    quizTitle: quiz.title,
    entries,
    totalEntries: countResult?.count || 0,
  };
}

/**
 * Get global leaderboard (aggregated across all quizzes)
 */
export async function getGlobalLeaderboard(
  limit: number = 10
): Promise<GlobalLeaderboard> {
  const results = await db
    .select({
      userId: quizAttempts.userId,
      sessionId: quizAttempts.sessionId,
      userName: sql<string>`COALESCE(${users.name}, ${sessions.displayName}, 'Anonymous')`,
      avatarUrl: users.avatarUrl,
      totalQuizzes: sql<number>`count(DISTINCT ${quizAttempts.quizId})::int`,
      averageScore: sql<number>`AVG(${quizAttempts.score})::numeric(5,2)`,
      totalScore: sql<number>`SUM(${quizAttempts.score})::numeric(5,2)`,
    })
    .from(quizAttempts)
    .leftJoin(sessions, eq(quizAttempts.sessionId, sessions.id))
    .leftJoin(users, eq(quizAttempts.userId, users.id))
    .where(eq(quizAttempts.status, 'completed'))
    .groupBy(quizAttempts.userId, quizAttempts.sessionId, users.name, sessions.displayName, users.avatarUrl)
    .orderBy(desc(sql`AVG(${quizAttempts.score})`))
    .limit(limit);

  const entries: GlobalLeaderboardEntry[] = results.map((r, index) => ({
    rank: index + 1,
    userId: r.userId,
    userName: r.userName,
    avatarUrl: r.avatarUrl,
    totalQuizzes: r.totalQuizzes,
    averageScore: Number(r.averageScore) || 0,
    totalScore: Number(r.totalScore) || 0,
  }));

  // Get total unique participants
  const [countResult] = await db
    .select({
      count: sql<number>`count(DISTINCT COALESCE(${quizAttempts.userId}::text, ${quizAttempts.sessionId}::text))::int`,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.status, 'completed'));

  return {
    entries,
    totalEntries: countResult?.count || 0,
  };
}

/**
 * Get user's rank on a specific quiz
 */
export async function getUserQuizRank(
  quizId: string,
  sessionId: string
): Promise<number | null> {
  const userAttempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.sessionId, sessionId),
      eq(quizAttempts.status, 'completed')
    ),
    orderBy: desc(quizAttempts.score),
  });

  if (!userAttempt || !userAttempt.score) {
    return null;
  }

  const [rankResult] = await db
    .select({
      rank: sql<number>`count(*)::int + 1`,
    })
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.quizId, quizId),
        eq(quizAttempts.status, 'completed'),
        sql`${quizAttempts.score} > ${userAttempt.score}`
      )
    );

  return rankResult?.rank || 1;
}
