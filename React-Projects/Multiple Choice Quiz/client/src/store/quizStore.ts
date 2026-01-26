import { create } from 'zustand';
import type { QuizWithQuestions } from 'shared';

interface Answer {
  optionIds: string[];
  isFlagged: boolean;
}

interface QuizState {
  currentQuiz: QuizWithQuestions | null;
  currentAttemptId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, Answer>;
  
  // Actions
  setQuiz: (quiz: QuizWithQuestions) => void;
  setAttemptId: (attemptId: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, optionIds: string[]) => void;
  toggleFlag: (questionId: string) => void;
  clearQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuiz: null,
  currentAttemptId: null,
  currentQuestionIndex: 0,
  answers: {},

  setQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      answers: {},
      currentQuestionIndex: 0,
    }),

  setAttemptId: (attemptId) => set({ currentAttemptId: attemptId }),

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  setAnswer: (questionId, optionIds) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          optionIds,
          isFlagged: state.answers[questionId]?.isFlagged || false,
        },
      },
    })),

  toggleFlag: (questionId) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          optionIds: state.answers[questionId]?.optionIds || [],
          isFlagged: !state.answers[questionId]?.isFlagged,
        },
      },
    })),

  clearQuiz: () =>
    set({
      currentQuiz: null,
      currentAttemptId: null,
      currentQuestionIndex: 0,
      answers: {},
    }),
}));
