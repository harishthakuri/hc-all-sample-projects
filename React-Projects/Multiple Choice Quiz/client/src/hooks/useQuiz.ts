import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizWithQuestions, AnswerSubmission } from 'shared';
import { attemptApi } from '@/lib/api';
import { useSession } from './useSession';
import { useQuizStore } from '@/store/quizStore';
import { toast } from './useToast';
import { shuffleArray } from '@/lib/utils';

/**
 * Hook for managing quiz state and operations
 */
export function useQuiz() {
  const navigate = useNavigate();
  const { sessionToken } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentQuiz,
    currentAttemptId,
    currentQuestionIndex,
    answers,
    setQuiz,
    setAttemptId,
    setCurrentQuestionIndex,
    setAnswer,
    toggleFlag,
    clearQuiz,
  } = useQuizStore();

  /**
   * Start a new quiz attempt
   */
  const startQuiz = useCallback(
    async (quizId: string) => {
      if (!sessionToken) {
        setError('Session not initialized');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await attemptApi.start({
          sessionToken,
          quizId,
        });

        // Shuffle questions for randomization
        const shuffledQuiz: QuizWithQuestions = {
          ...response.quiz,
          questions: shuffleArray(response.quiz.questions).map((q, index) => ({
            ...q,
            order: index + 1,
            options: shuffleArray(q.options), // Also shuffle options
          })),
        };

        setQuiz(shuffledQuiz);
        setAttemptId(response.attemptId);
        setCurrentQuestionIndex(0);

        navigate(`/quiz/${quizId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start quiz';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionToken, navigate, setQuiz, setAttemptId, setCurrentQuestionIndex]
  );

  /**
   * Resume an existing quiz attempt
   */
  const resumeQuiz = useCallback(
    async (attemptId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await attemptApi.get(attemptId);

        // Don't shuffle on resume - keep original order
        setQuiz(response.quiz);
        setAttemptId(response.attemptId);
        // The current question will be set from saved progress
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to resume quiz';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setQuiz, setAttemptId]
  );

  /**
   * Answer current question
   */
  const answerQuestion = useCallback(
    (questionId: string, optionIds: string[]) => {
      setAnswer(questionId, optionIds);
    },
    [setAnswer]
  );

  /**
   * Navigate to next question
   */
  const nextQuestion = useCallback(() => {
    if (!currentQuiz) return;
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuiz, currentQuestionIndex, setCurrentQuestionIndex]);

  /**
   * Navigate to previous question
   */
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  /**
   * Go to specific question
   */
  const goToQuestion = useCallback(
    (index: number) => {
      if (!currentQuiz) return;
      if (index >= 0 && index < currentQuiz.questions.length) {
        setCurrentQuestionIndex(index);
      }
    },
    [currentQuiz, setCurrentQuestionIndex]
  );

  /**
   * Save progress to server
   */
  const saveProgress = useCallback(async () => {
    if (!currentAttemptId || !currentQuiz) return;

    try {
      const answerSubmissions: AnswerSubmission[] = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          optionIds: answer.optionIds,
          isFlagged: answer.isFlagged,
        })
      );

      await attemptApi.saveProgress(currentAttemptId, {
        currentQuestion: currentQuestionIndex,
        answers: answerSubmissions,
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [currentAttemptId, currentQuiz, answers, currentQuestionIndex]);

  /**
   * Submit the quiz
   */
  const submitQuiz = useCallback(async () => {
    if (!currentAttemptId) {
      setError('No active attempt');
      return;
    }

    setIsLoading(true);

    try {
      // First save final progress
      await saveProgress();

      // Then submit
      const result = await attemptApi.submit(currentAttemptId);

      toast({
        title: 'Quiz Submitted!',
        description: `You scored ${result.score.toFixed(1)}%`,
        variant: 'success',
      });

      // Navigate to results
      navigate(`/results/${currentAttemptId}`);
      clearQuiz();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAttemptId, saveProgress, navigate, clearQuiz]);

  /**
   * Get current question
   */
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex] || null;

  /**
   * Get answer for a question
   */
  const getAnswer = useCallback(
    (questionId: string) => answers[questionId] || null,
    [answers]
  );

  /**
   * Check if question is answered
   */
  const isQuestionAnswered = useCallback(
    (questionId: string) => {
      const answer = answers[questionId];
      return answer ? answer.optionIds.length > 0 : false;
    },
    [answers]
  );

  /**
   * Get quiz progress
   */
  const progress = currentQuiz
    ? {
        total: currentQuiz.questions.length,
        answered: Object.values(answers).filter((a) => a.optionIds.length > 0).length,
        flagged: Object.values(answers).filter((a) => a.isFlagged).length,
        current: currentQuestionIndex + 1,
      }
    : null;

  return {
    // State
    currentQuiz,
    currentQuestion,
    currentQuestionIndex,
    currentAttemptId,
    answers,
    isLoading,
    error,
    progress,

    // Actions
    startQuiz,
    resumeQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleFlag,
    saveProgress,
    submitQuiz,
    getAnswer,
    isQuestionAnswered,
    clearQuiz,
  };
}
