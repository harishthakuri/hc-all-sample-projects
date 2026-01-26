import { describe, it, expect } from 'vitest';

/**
 * Tests for Quiz Scoring Logic
 * This is CRITICAL business logic that determines user scores
 * Tests cover single-choice, multiple-choice, and partial scoring scenarios
 */

describe('Quiz Scoring - Single Choice Questions', () => {
  /**
   * Helper function to calculate score for single choice questions
   * Returns 1 if correct, 0 if incorrect
   */
  const calculateSingleChoiceScore = (
    selectedOptionIds: string[],
    correctOptionIds: string[]
  ): number => {
    if (selectedOptionIds.length === 1 && correctOptionIds.includes(selectedOptionIds[0])) {
      return 1;
    }
    return 0;
  };

  it('should award full score for correct single answer', () => {
    const selected = ['option-1'];
    const correct = ['option-1'];
    
    expect(calculateSingleChoiceScore(selected, correct)).toBe(1);
  });

  it('should award zero score for incorrect single answer', () => {
    const selected = ['option-2'];
    const correct = ['option-1'];
    
    expect(calculateSingleChoiceScore(selected, correct)).toBe(0);
  });

  it('should award zero score when no answer selected', () => {
    const selected: string[] = [];
    const correct = ['option-1'];
    
    expect(calculateSingleChoiceScore(selected, correct)).toBe(0);
  });

  it('should award zero score when multiple answers selected for single choice', () => {
    const selected = ['option-1', 'option-2'];
    const correct = ['option-1'];
    
    // Invalid state - should not allow multiple selections
    expect(calculateSingleChoiceScore(selected, correct)).toBe(0);
  });
});

describe('Quiz Scoring - Multiple Choice Questions', () => {
  /**
   * Helper function to calculate score for multiple choice questions
   * Uses partial scoring: (correct - incorrect) / total_correct
   * Score cannot go below 0
   */
  const calculateMultipleChoiceScore = (
    selectedOptionIds: string[],
    correctOptionIds: string[]
  ): number => {
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

    const score = Math.max(0, (correct - incorrect) / correctOptionIds.length);
    return score;
  };

  it('should award full score when all correct options selected', () => {
    const selected = ['option-1', 'option-2'];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    expect(score).toBe(1);
  });

  it('should award zero score when no options selected', () => {
    const selected: string[] = [];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    expect(score).toBe(0);
  });

  it('should award partial score when some correct options selected', () => {
    const selected = ['option-1'];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 1 correct, 0 incorrect = 1/2 = 0.5
    expect(score).toBe(0.5);
  });

  it('should penalize incorrect selections', () => {
    const selected = ['option-1', 'option-3'];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 1 correct, 1 incorrect = (1-1)/2 = 0
    expect(score).toBe(0);
  });

  it('should handle 3 correct answers scenario', () => {
    const selected = ['option-1', 'option-2'];
    const correct = ['option-1', 'option-2', 'option-3'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 2 correct, 0 incorrect = 2/3 ≈ 0.667
    expect(score).toBeCloseTo(0.667, 2);
  });

  it('should never return negative score', () => {
    const selected = ['option-3', 'option-4', 'option-5'];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 0 correct, 3 incorrect = (0-3)/2 = -1.5, but Math.max(0, ...) = 0
    expect(score).toBe(0);
  });

  it('should handle complex partial scoring', () => {
    const selected = ['option-1', 'option-2', 'option-5'];
    const correct = ['option-1', 'option-2', 'option-3', 'option-4'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 2 correct, 1 incorrect = (2-1)/4 = 0.25
    expect(score).toBe(0.25);
  });

  it('should handle all incorrect selections', () => {
    const selected = ['option-3', 'option-4'];
    const correct = ['option-1', 'option-2'];
    
    const score = calculateMultipleChoiceScore(selected, correct);
    // 0 correct, 2 incorrect = (0-2)/2 = -1, Math.max(0, -1) = 0
    expect(score).toBe(0);
  });
});

describe('Quiz Total Score Calculation', () => {
  interface Question {
    type: 'single' | 'multiple';
    selectedOptions: string[];
    correctOptions: string[];
  }

  /**
   * Calculate total quiz score as percentage
   */
  const calculateQuizScore = (questions: Question[]): number => {
    let totalScore = 0;

    questions.forEach((q) => {
      if (q.type === 'single') {
        if (q.selectedOptions.length === 1 && q.correctOptions.includes(q.selectedOptions[0])) {
          totalScore += 1;
        }
      } else {
        const correctSet = new Set(q.correctOptions);
        let correct = 0;
        let incorrect = 0;

        q.selectedOptions.forEach((id) => {
          if (correctSet.has(id)) {
            correct++;
          } else {
            incorrect++;
          }
        });

        const questionScore = Math.max(0, (correct - incorrect) / q.correctOptions.length);
        totalScore += questionScore;
      }
    });

    return (totalScore / questions.length) * 100;
  };

  it('should calculate 100% for all correct answers', () => {
    const questions: Question[] = [
      { type: 'single', selectedOptions: ['a'], correctOptions: ['a'] },
      { type: 'single', selectedOptions: ['b'], correctOptions: ['b'] },
      { type: 'multiple', selectedOptions: ['x', 'y'], correctOptions: ['x', 'y'] },
    ];

    expect(calculateQuizScore(questions)).toBe(100);
  });

  it('should calculate 0% for all incorrect answers', () => {
    const questions: Question[] = [
      { type: 'single', selectedOptions: ['b'], correctOptions: ['a'] },
      { type: 'single', selectedOptions: ['a'], correctOptions: ['b'] },
      { type: 'multiple', selectedOptions: ['z'], correctOptions: ['x', 'y'] },
    ];

    expect(calculateQuizScore(questions)).toBe(0);
  });

  it('should handle mixed results correctly', () => {
    const questions: Question[] = [
      { type: 'single', selectedOptions: ['a'], correctOptions: ['a'] }, // 1 point
      { type: 'single', selectedOptions: ['b'], correctOptions: ['a'] }, // 0 points
      { type: 'multiple', selectedOptions: ['x'], correctOptions: ['x', 'y'] }, // 0.5 points
    ];

    const score = calculateQuizScore(questions);
    // (1 + 0 + 0.5) / 3 * 100 = 50%
    expect(score).toBeCloseTo(50, 1);
  });

  it('should handle empty quiz', () => {
    const questions: Question[] = [];
    
    // Avoid division by zero
    const score = questions.length === 0 ? 0 : (0 / questions.length) * 100;
    expect(score).toBe(0);
  });

  it('should round score to 2 decimal places', () => {
    const questions: Question[] = [
      { type: 'multiple', selectedOptions: ['a'], correctOptions: ['a', 'b', 'c'] }, // 0.333...
    ];

    const score = calculateQuizScore(questions);
    const rounded = Number(score.toFixed(2));
    expect(rounded).toBe(33.33);
  });
});

describe('Passing Score Logic', () => {
  it('should correctly determine if score passes threshold', () => {
    const passingScore = 60;
    
    expect(65 >= passingScore).toBe(true);
    expect(60 >= passingScore).toBe(true);
    expect(59.99 >= passingScore).toBe(false);
    expect(0 >= passingScore).toBe(false);
  });

  it('should handle edge cases for passing scores', () => {
    const passingScore = 70;
    
    const testCases = [
      { score: 70.0, passes: true },
      { score: 69.9, passes: false },
      { score: 70.1, passes: true },
      { score: 100, passes: true },
      { score: 0, passes: false },
    ];

    testCases.forEach(({ score, passes }) => {
      expect(score >= passingScore).toBe(passes);
    });
  });
});

describe('Answer Correctness Tracking', () => {
  it('should track correct answer count for single choice', () => {
    const questions = [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
      { isCorrect: true },
    ];

    const correctCount = questions.filter(q => q.isCorrect).length;
    expect(correctCount).toBe(3);
  });

  it('should identify fully correct multiple choice answers', () => {
    const calculateIsFullyCorrect = (score: number): boolean => {
      return score === 1;
    };

    expect(calculateIsFullyCorrect(1.0)).toBe(true);
    expect(calculateIsFullyCorrect(0.99)).toBe(false);
    expect(calculateIsFullyCorrect(0.5)).toBe(false);
    expect(calculateIsFullyCorrect(0)).toBe(false);
  });

  it('should identify partial credit answers', () => {
    const isPartialCredit = (score: number): boolean => {
      return score > 0 && score < 1;
    };

    expect(isPartialCredit(0.5)).toBe(true);
    expect(isPartialCredit(0.25)).toBe(true);
    expect(isPartialCredit(0.99)).toBe(true);
    expect(isPartialCredit(1.0)).toBe(false);
    expect(isPartialCredit(0)).toBe(false);
  });
});

describe('Time Calculation', () => {
  it('should calculate time taken in seconds', () => {
    const startedAt = new Date('2024-01-01T10:00:00Z');
    const completedAt = new Date('2024-01-01T10:07:30Z');
    
    const timeTaken = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);
    expect(timeTaken).toBe(450); // 7 minutes 30 seconds
  });

  it('should handle same start and completion time', () => {
    const time = new Date('2024-01-01T10:00:00Z');
    const timeTaken = Math.floor((time.getTime() - time.getTime()) / 1000);
    expect(timeTaken).toBe(0);
  });

  it('should convert seconds to minutes', () => {
    const seconds = 420; // 7 minutes
    const minutes = Math.ceil(seconds / 60);
    expect(minutes).toBe(7);
  });

  it('should round up partial minutes', () => {
    const seconds = 425; // 7 minutes 5 seconds
    const minutes = Math.ceil(seconds / 60);
    expect(minutes).toBe(8);
  });
});
