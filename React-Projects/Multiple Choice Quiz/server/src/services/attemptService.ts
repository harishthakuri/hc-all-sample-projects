import { eq, and, desc } from 'drizzle-orm';
import { db, quizAttempts, attemptAnswers, quizzes, questions, options, sessions } from '../db';
import { getQuizForTaking, getQuizById } from './quizService';
import { getSessionByToken } from './sessionService';
import type {
  StartAttemptResponse,
  SaveProgressRequest,
  SubmitQuizResponse,
  QuizResults,
  QuestionResult,
  OptionWithCorrect,
  AttemptSummary,
} from 'shared';

/**
 * Start a new quiz attempt or resume existing one
 */
export async function startAttempt(
  sessionToken: string,
  quizId: string
): Promise<StartAttemptResponse> {
  const session = await getSessionByToken(sessionToken);
  if (!session) {
    throw new Error('Invalid session');
  }

  const quiz = await getQuizForTaking(quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Check for existing in-progress attempt for this quiz
  const existingAttempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.sessionId, session.id),
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.status, 'in_progress')
    ),
    orderBy: [desc(quizAttempts.startedAt)],
  });

  // If there's an existing in-progress attempt, return it
  if (existingAttempt) {
    return {
      attemptId: existingAttempt.id,
      quiz,
    };
  }

  // Create new attempt
  const [attempt] = await db
    .insert(quizAttempts)
    .values({
      sessionId: session.id,
      quizId,
      status: 'in_progress',
      currentQuestion: 0,
    })
    .returning();

  return {
    attemptId: attempt.id,
    quiz,
  };
}

/**
 * Get attempt for resuming
 */
export async function getAttempt(attemptId: string): Promise<StartAttemptResponse | null> {
  const attempt = await db.query.quizAttempts.findFirst({
    where: eq(quizAttempts.id, attemptId),
    with: {
      quiz: true,
      answers: true,
    },
  });

  if (!attempt) {
    return null;
  }

  const quiz = await getQuizForTaking(attempt.quizId);
  if (!quiz) {
    return null;
  }

  return {
    attemptId: attempt.id,
    quiz,
  };
}

/**
 * Save quiz progress
 */
export async function saveProgress(
  attemptId: string,
  data: SaveProgressRequest
) {
  // Update attempt's current question
  await db
    .update(quizAttempts)
    .set({ currentQuestion: data.currentQuestion })
    .where(eq(quizAttempts.id, attemptId));

  // Delete existing answers for this attempt
  await db
    .delete(attemptAnswers)
    .where(eq(attemptAnswers.attemptId, attemptId));

  // Insert new answers
  if (data.answers.length > 0) {
    const answerRecords = data.answers.flatMap((answer) =>
      answer.optionIds.length > 0
        ? answer.optionIds.map((optionId) => ({
            attemptId,
            questionId: answer.questionId,
            optionId,
            isFlagged: answer.isFlagged,
            answeredAt: new Date(),
          }))
        : [
            {
              attemptId,
              questionId: answer.questionId,
              optionId: null,
              isFlagged: answer.isFlagged,
              answeredAt: null,
            },
          ]
    );

    await db.insert(attemptAnswers).values(answerRecords);
  }

  return {
    success: true,
    savedAt: new Date(),
  };
}

/**
 * Submit quiz and calculate score
 */
export async function submitQuiz(attemptId: string): Promise<SubmitQuizResponse> {
  const attempt = await db.query.quizAttempts.findFirst({
    where: eq(quizAttempts.id, attemptId),
    with: {
      answers: true,
    },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  // Calculate score
  let totalScore = 0;
  let correctAnswers = 0;

  for (const question of quiz.questions) {
    const questionAnswers = attempt.answers.filter(
      (a) => a.questionId === question.id && a.optionId
    );
    const selectedOptionIds = questionAnswers.map((a) => a.optionId!);
    const correctOptionIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    if (question.type === 'single') {
      // Single choice: correct if exactly one correct answer selected
      if (
        selectedOptionIds.length === 1 &&
        correctOptionIds.includes(selectedOptionIds[0])
      ) {
        totalScore += 1;
        correctAnswers += 1;
      }
    } else {
      // Multiple choice: partial scoring
      const correctSet = new Set(correctOptionIds);
      let correct = 0;
      let incorrect = 0;

      selectedOptionIds.forEach((id) => {
        if (correctSet.has(id)) {
          correct++;
        } else {
          incorrect++;
        }
      });

      const questionScore = Math.max(
        0,
        (correct - incorrect) / correctOptionIds.length
      );
      totalScore += questionScore;
      if (questionScore === 1) {
        correctAnswers += 1;
      }
    }

    // Update answer correctness
    for (const answer of questionAnswers) {
      if (answer.optionId) {
        const option = question.options.find((o) => o.id === answer.optionId);
        await db
          .update(attemptAnswers)
          .set({ isCorrect: option?.isCorrect || false })
          .where(eq(attemptAnswers.id, answer.id));
      }
    }
  }

  const scorePercent = (totalScore / quiz.questions.length) * 100;
  const completedAt = new Date();

  // Update attempt
  await db
    .update(quizAttempts)
    .set({
      status: 'completed',
      score: scorePercent.toFixed(2),
      completedAt,
    })
    .where(eq(quizAttempts.id, attemptId));

  return {
    score: scorePercent,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    completedAt,
  };
}

/**
 * Get detailed results for an attempt
 */
export async function getResults(attemptId: string): Promise<QuizResults> {
  const attempt = await db.query.quizAttempts.findFirst({
    where: eq(quizAttempts.id, attemptId),
    with: {
      quiz: true,
      answers: true,
    },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  const quiz = await getQuizById(attempt.quizId);
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  let partialAnswers = 0;
  let correctAnswers = 0;

  const questionResults: QuestionResult[] = quiz.questions.map((question) => {
    const questionAnswers = attempt.answers.filter(
      (a) => a.questionId === question.id && a.optionId
    );
    const selectedOptionIds = questionAnswers.map((a) => a.optionId!);
    const correctOptionIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    // Calculate score for this question
    let score = 0;
    let isCorrect = false;

    if (question.type === 'single') {
      if (
        selectedOptionIds.length === 1 &&
        correctOptionIds.includes(selectedOptionIds[0])
      ) {
        score = 1;
        isCorrect = true;
        correctAnswers++;
      }
    } else {
      const correctSet = new Set(correctOptionIds);
      let correct = 0;
      let incorrect = 0;

      selectedOptionIds.forEach((id) => {
        if (correctSet.has(id)) {
          correct++;
        } else {
          incorrect++;
        }
      });

      score = Math.max(0, (correct - incorrect) / correctOptionIds.length);
      isCorrect = score === 1;
      if (isCorrect) {
        correctAnswers++;
      } else if (score > 0) {
        partialAnswers++;
      }
    }

    const optionsWithCorrect: OptionWithCorrect[] = question.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.isCorrect,
      wasSelected: selectedOptionIds.includes(opt.id),
    }));

    return {
      questionId: question.id,
      questionText: question.text,
      questionType: question.type as 'single' | 'multiple',
      selectedOptionIds,
      correctOptionIds,
      options: optionsWithCorrect,
      isCorrect,
      score,
      explanation: question.explanation,
    };
  });

  const timeTaken = attempt.completedAt && attempt.startedAt
    ? Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    : 0;

  return {
    attemptId: attempt.id,
    quizId: attempt.quizId,
    quizTitle: quiz.title,
    score: Number(attempt.score) || 0,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    partialAnswers,
    completedAt: attempt.completedAt || new Date(),
    timeTaken,
    questions: questionResults,
  };
}

/**
 * Get attempt history for a session
 */
export async function getHistory(sessionToken: string): Promise<AttemptSummary[]> {
  const session = await getSessionByToken(sessionToken);
  if (!session) {
    return [];
  }

  const attempts = await db
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
    .where(eq(quizAttempts.sessionId, session.id))
    .orderBy(desc(quizAttempts.startedAt));

  // Get question counts for each quiz
  const quizIds = [...new Set(attempts.map((a) => a.quizId))];
  const quizQuestionCounts: Record<string, number> = {};

  for (const quizId of quizIds) {
    const quiz = await db.query.quizzes.findFirst({
      where: eq(quizzes.id, quizId),
      with: { questions: true },
    });
    quizQuestionCounts[quizId] = quiz?.questions.length || 0;
  }

  return attempts.map((attempt) => ({
    id: attempt.id,
    quizId: attempt.quizId,
    quizTitle: attempt.quizTitle,
    status: attempt.status as 'in_progress' | 'completed' | 'abandoned',
    score: attempt.score ? Number(attempt.score) : null,
    totalQuestions: quizQuestionCounts[attempt.quizId] || 0,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
  }));
}
