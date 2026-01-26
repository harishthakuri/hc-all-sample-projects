import { eq, and, gt } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db, sessions, quizAttempts, quizzes } from '../db';
import type { AttemptSummary } from 'shared';

const SESSION_EXPIRY_DAYS = Number(process.env.SESSION_EXPIRY_DAYS) || 30;

/**
 * Create a new session
 */
export async function createSession() {
  const sessionToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const [session] = await db
    .insert(sessions)
    .values({
      sessionToken,
      expiresAt,
    })
    .returning();

  return {
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
  };
}

/**
 * Validate and refresh a session
 */
export async function validateSession(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.sessionToken, token),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) {
    return { valid: false };
  }

  // Update last active time
  await db
    .update(sessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(sessions.id, session.id));

  // Check for in-progress attempts
  const [inProgressAttempt] = await db
    .select({
      id: quizAttempts.id,
      quizId: quizAttempts.quizId,
      quizTitle: quizzes.title,
      status: quizAttempts.status,
      score: quizAttempts.score,
      startedAt: quizAttempts.startedAt,
      completedAt: quizAttempts.completedAt,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .where(
      and(
        eq(quizAttempts.sessionId, session.id),
        eq(quizAttempts.status, 'in_progress')
      )
    )
    .limit(1);

  let inProgressSummary: AttemptSummary | undefined;
  if (inProgressAttempt) {
    // Get question count
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, inProgressAttempt.quizId),
      with: { questions: true },
    });

    inProgressSummary = {
      id: inProgressAttempt.id,
      quizId: inProgressAttempt.quizId,
      quizTitle: inProgressAttempt.quizTitle,
      status: inProgressAttempt.status as 'in_progress',
      score: inProgressAttempt.score ? Number(inProgressAttempt.score) : null,
      totalQuestions: quiz?.questions.length || 0,
      startedAt: inProgressAttempt.startedAt,
      completedAt: inProgressAttempt.completedAt,
    };
  }

  return {
    valid: true,
    session: {
      id: session.id,
      sessionToken: session.sessionToken,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
    },
    inProgressAttempt: inProgressSummary,
  };
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionToken, token))
    .limit(1);

  return session || null;
}
