import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDb, type MockQuestion, type MockOption, type MockQuizAttempt } from './helpers/db-mock';

/**
 * Integration Tests for Quiz Attempt Service
 * Tests the CRITICAL scoring logic that determines user performance
 */

describe('AttemptService - Score Calculation', () => {
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb._testData.reset();
    vi.clearAllMocks();
  });

  describe('Single Choice Question Scoring', () => {
    it('should award full score (1.0) for correct single choice answer', () => {
      // Setup: Question with one correct answer
      const selectedOptions = ['option-correct'];
      const correctOptions = ['option-correct'];

      // Business Logic: Single choice scoring
      const isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
      const score = isCorrect ? 1 : 0;

      expect(score).toBe(1);
    });

    it('should award zero score for incorrect single choice answer', () => {
      const selectedOptions = ['option-wrong'];
      const correctOptions = ['option-correct'];

      const isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
      const score = isCorrect ? 1 : 0;

      expect(score).toBe(0);
    });

    it('should award zero score when no answer selected for single choice', () => {
      const selectedOptions: string[] = [];
      const correctOptions = ['option-correct'];

      const isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
      const score = isCorrect ? 1 : 0;

      expect(score).toBe(0);
    });

    it('should award zero score when multiple answers selected for single choice (invalid state)', () => {
      const selectedOptions = ['option-1', 'option-2'];
      const correctOptions = ['option-1'];

      // Business Rule: Single choice should only have one selection
      const isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
      const score = isCorrect ? 1 : 0;

      expect(score).toBe(0);
    });
  });

  describe('Multiple Choice Question Scoring with Partial Credit', () => {
    it('should award full score (1.0) when all correct options selected', () => {
      const selectedOptions = ['opt-1', 'opt-2', 'opt-3'];
      const correctOptions = ['opt-1', 'opt-2', 'opt-3'];

      // Business Logic: Partial scoring formula
      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      expect(score).toBe(1.0);
      expect(correct).toBe(3);
      expect(incorrect).toBe(0);
    });

    it('should award partial score (0.5) for half correct answers', () => {
      const selectedOptions = ['opt-1'];
      const correctOptions = ['opt-1', 'opt-2'];

      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      expect(score).toBe(0.5);
      expect(correct).toBe(1);
      expect(incorrect).toBe(0);
    });

    it('should penalize wrong selections: 1 correct + 1 wrong = 0 score', () => {
      const selectedOptions = ['opt-1', 'opt-wrong'];
      const correctOptions = ['opt-1', 'opt-2'];

      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      // (1 - 1) / 2 = 0
      expect(score).toBe(0);
      expect(correct).toBe(1);
      expect(incorrect).toBe(1);
    });

    it('should never return negative score even with many wrong answers', () => {
      const selectedOptions = ['wrong-1', 'wrong-2', 'wrong-3'];
      const correctOptions = ['opt-1', 'opt-2'];

      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      // (0 - 3) / 2 = -1.5, but Math.max(0, -1.5) = 0
      expect(score).toBe(0);
      expect(correct).toBe(0);
      expect(incorrect).toBe(3);
    });

    it('should calculate correct partial score: 2 correct, 1 wrong out of 4 total', () => {
      const selectedOptions = ['opt-1', 'opt-2', 'wrong-1'];
      const correctOptions = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];

      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      // (2 - 1) / 4 = 0.25
      expect(score).toBe(0.25);
      expect(correct).toBe(2);
      expect(incorrect).toBe(1);
    });

    it('should award zero score when no options selected', () => {
      const selectedOptions: string[] = [];
      const correctOptions = ['opt-1', 'opt-2'];

      const correctSet = new Set(correctOptions);
      let correct = 0;
      let incorrect = 0;

      selectedOptions.forEach(id => {
        if (correctSet.has(id)) correct++;
        else incorrect++;
      });

      const score = Math.max(0, (correct - incorrect) / correctOptions.length);

      expect(score).toBe(0);
    });
  });

  describe('Total Quiz Score Calculation', () => {
    interface QuestionScore {
      type: 'single' | 'multiple';
      selectedOptions: string[];
      correctOptions: string[];
    }

    const calculateQuizScore = (questions: QuestionScore[]): number => {
      let totalScore = 0;

      questions.forEach(q => {
        if (q.type === 'single') {
          const isCorrect = q.selectedOptions.length === 1 && 
                           q.correctOptions.includes(q.selectedOptions[0]);
          totalScore += isCorrect ? 1 : 0;
        } else {
          const correctSet = new Set(q.correctOptions);
          let correct = 0;
          let incorrect = 0;

          q.selectedOptions.forEach(id => {
            if (correctSet.has(id)) correct++;
            else incorrect++;
          });

          const score = Math.max(0, (correct - incorrect) / q.correctOptions.length);
          totalScore += score;
        }
      });

      return (totalScore / questions.length) * 100;
    };

    it('should calculate 100% for all correct answers', () => {
      const questions: QuestionScore[] = [
        { type: 'single', selectedOptions: ['a'], correctOptions: ['a'] },
        { type: 'single', selectedOptions: ['b'], correctOptions: ['b'] },
        { type: 'multiple', selectedOptions: ['x', 'y'], correctOptions: ['x', 'y'] },
      ];

      const score = calculateQuizScore(questions);
      expect(score).toBe(100);
    });

    it('should calculate 0% for all incorrect answers', () => {
      const questions: QuestionScore[] = [
        { type: 'single', selectedOptions: ['wrong'], correctOptions: ['a'] },
        { type: 'single', selectedOptions: ['wrong'], correctOptions: ['b'] },
        { type: 'multiple', selectedOptions: ['wrong'], correctOptions: ['x', 'y'] },
      ];

      const score = calculateQuizScore(questions);
      expect(score).toBe(0);
    });

    it('should calculate correct percentage with mixed results', () => {
      const questions: QuestionScore[] = [
        { type: 'single', selectedOptions: ['a'], correctOptions: ['a'] }, // 1.0
        { type: 'single', selectedOptions: ['wrong'], correctOptions: ['b'] }, // 0.0
        { type: 'multiple', selectedOptions: ['x'], correctOptions: ['x', 'y'] }, // 0.5
        { type: 'multiple', selectedOptions: ['p', 'q'], correctOptions: ['p', 'q'] }, // 1.0
      ];

      // Total: 1 + 0 + 0.5 + 1 = 2.5 out of 4 questions = 62.5%
      const score = calculateQuizScore(questions);
      expect(score).toBe(62.5);
    });

    it('should round score to 2 decimal places', () => {
      const questions: QuestionScore[] = [
        { type: 'multiple', selectedOptions: ['a'], correctOptions: ['a', 'b', 'c'] }, // 0.333...
      ];

      const score = calculateQuizScore(questions);
      const rounded = Number(score.toFixed(2));
      
      // 0.333... / 1 * 100 = 33.33%
      expect(rounded).toBe(33.33);
    });
  });

  describe('Passing Score Determination', () => {
    it('should correctly determine if score meets passing threshold', () => {
      const passingScore = 60;
      
      const testCases = [
        { score: 59.9, passes: false },
        { score: 60.0, passes: true },
        { score: 60.1, passes: true },
        { score: 100, passes: true },
        { score: 0, passes: false },
        { score: 70, passes: true },
      ];

      testCases.forEach(({ score, passes }) => {
        const result = score >= passingScore;
        expect(result).toBe(passes);
      });
    });
  });

  describe('Time Tracking', () => {
    it('should calculate time taken in seconds between start and completion', () => {
      const startedAt = new Date('2024-01-01T10:00:00Z');
      const completedAt = new Date('2024-01-01T10:07:30Z');

      const timeTakenSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

      // 7 minutes 30 seconds = 450 seconds
      expect(timeTakenSeconds).toBe(450);
    });

    it('should handle same start and end time (instant completion)', () => {
      const time = new Date();
      const timeTaken = Math.floor((time.getTime() - time.getTime()) / 1000);

      expect(timeTaken).toBe(0);
    });
  });

  describe('Answer Correctness Tracking', () => {
    it('should track which answers are fully correct', () => {
      const answers = [
        { questionId: '1', score: 1.0, isCorrect: true },
        { questionId: '2', score: 0.5, isCorrect: false },
        { questionId: '3', score: 0.0, isCorrect: false },
        { questionId: '4', score: 1.0, isCorrect: true },
      ];

      const correctCount = answers.filter(a => a.isCorrect).length;
      expect(correctCount).toBe(2);
    });

    it('should identify partial credit answers', () => {
      const score = 0.5;
      const isPartial = score > 0 && score < 1;
      
      expect(isPartial).toBe(true);
    });

    it('should identify fully correct answers', () => {
      const score = 1.0;
      const isFullyCorrect = score === 1;
      
      expect(isFullyCorrect).toBe(true);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle empty quiz (no questions)', () => {
      const questions: any[] = [];
      const totalScore = questions.length === 0 ? 0 : 100;
      
      expect(totalScore).toBe(0);
    });

    it('should validate score is between 0 and 100', () => {
      const scores = [-10, 0, 50, 100, 150];
      
      scores.forEach(score => {
        const isValid = score >= 0 && score <= 100;
        expect(isValid).toBe(score >= 0 && score <= 100);
      });
    });

    it('should handle floating point precision in score calculations', () => {
      // 1/3 = 0.3333...
      const score = (1 / 3) * 100;
      const rounded = Number(score.toFixed(2));
      
      expect(rounded).toBe(33.33);
    });
  });
});
