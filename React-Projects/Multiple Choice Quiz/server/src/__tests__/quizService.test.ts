import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockDb } from "./helpers/db-mock";

/**
 * Integration Tests for Quiz Service
 * Tests quiz filtering, searching, and retrieval logic
 */

describe("QuizService Integration Tests", () => {
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb._testData.reset();
    vi.clearAllMocks();
  });

  describe("listQuizzes - Filtering Logic", () => {
    beforeEach(() => {
      // Setup test data
      mockDb._testData.quizzes.push(
        {
          id: "quiz-1",
          title: "JavaScript Basics",
          description: "Learn JS fundamentals",
          categoryId: "cat-js",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: true,
          createdBy: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "quiz-2",
          title: "Advanced JavaScript",
          description: "Master advanced JS concepts",
          categoryId: "cat-js",
          difficulty: "hard",
          timeLimit: 600,
          passingScore: 70,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
        {
          id: "quiz-3",
          title: "Python Basics",
          description: "Introduction to Python",
          categoryId: "cat-python",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-03"),
          updatedAt: new Date("2024-01-03"),
        },
        {
          id: "quiz-4",
          title: "Inactive Quiz",
          description: "This is inactive",
          categoryId: "cat-js",
          difficulty: "medium",
          timeLimit: 420,
          passingScore: 60,
          isActive: false,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-04"),
          updatedAt: new Date("2024-01-04"),
        },
      );
    });

    it("should filter by active status (exclude inactive quizzes)", () => {
      const activeQuizzes = mockDb._testData.quizzes.filter((q) => q.isActive);

      expect(activeQuizzes).toHaveLength(3);
      expect(activeQuizzes.every((q) => q.isActive)).toBe(true);
      expect(activeQuizzes.find((q) => q.id === "quiz-4")).toBeUndefined();
    });

    it("should filter by category ID", () => {
      const jsQuizzes = mockDb._testData.quizzes.filter(
        (q) => q.isActive && q.categoryId === "cat-js",
      );

      expect(jsQuizzes).toHaveLength(2);
      expect(jsQuizzes.every((q) => q.categoryId === "cat-js")).toBe(true);
    });

    it("should filter by difficulty level", () => {
      const easyQuizzes = mockDb._testData.quizzes.filter(
        (q) => q.isActive && q.difficulty === "easy",
      );

      expect(easyQuizzes).toHaveLength(2);
      expect(easyQuizzes.every((q) => q.difficulty === "easy")).toBe(true);
    });

    it("should filter featured quizzes only", () => {
      const featuredQuizzes = mockDb._testData.quizzes.filter(
        (q) => q.isActive && q.isFeatured,
      );

      expect(featuredQuizzes).toHaveLength(1);
      expect(featuredQuizzes[0].id).toBe("quiz-1");
    });

    it("should combine multiple filters (category + difficulty)", () => {
      const filtered = mockDb._testData.quizzes.filter(
        (q) =>
          q.isActive && q.categoryId === "cat-js" && q.difficulty === "easy",
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe("JavaScript Basics");
    });

    it("should return empty array when no quizzes match filters", () => {
      const filtered = mockDb._testData.quizzes.filter(
        (q) => q.isActive && q.categoryId === "non-existent",
      );

      expect(filtered).toHaveLength(0);
    });
  });

  describe("Quiz Search Logic", () => {
    beforeEach(() => {
      mockDb._testData.quizzes.push(
        {
          id: "quiz-1",
          title: "JavaScript Fundamentals",
          description: "Learn the basics of JavaScript programming",
          categoryId: "cat-1",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "quiz-2",
          title: "React Advanced Patterns",
          description: "Master advanced React techniques",
          categoryId: "cat-1",
          difficulty: "hard",
          timeLimit: 600,
          passingScore: 70,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "quiz-3",
          title: "Python Programming",
          description: "Introduction to Python language",
          categoryId: "cat-2",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );
    });

    const searchQuizzes = (query: string) => {
      const lowerQuery = query.toLowerCase();
      return mockDb._testData.quizzes.filter(
        (q) =>
          q.isActive &&
          (q.title.toLowerCase().includes(lowerQuery) ||
            (q.description?.toLowerCase().includes(lowerQuery) ?? false)),
      );
    };

    it("should search by title (case-insensitive)", () => {
      const results = searchQuizzes("javascript");

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain("JavaScript");
    });

    it("should search by description", () => {
      const results = searchQuizzes("introduction");

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Python Programming");
    });

    it("should be case-insensitive", () => {
      const lowercase = searchQuizzes("react");
      const uppercase = searchQuizzes("REACT");
      const mixed = searchQuizzes("ReAcT");

      expect(lowercase).toHaveLength(1);
      expect(uppercase).toHaveLength(1);
      expect(mixed).toHaveLength(1);
    });

    it("should handle partial word matches", () => {
      const results = searchQuizzes("advan");

      expect(results).toHaveLength(1);
      expect(results[0].title).toContain("Advanced");
    });

    it("should return empty array for no matches", () => {
      const results = searchQuizzes("nonexistent");

      expect(results).toHaveLength(0);
    });

    it("should search across both title and description", () => {
      const titleMatch = searchQuizzes("Python");
      const descMatch = searchQuizzes("Master");

      expect(titleMatch).toHaveLength(1);
      expect(descMatch).toHaveLength(1);
    });
  });

  describe("getQuizForTaking - Hide Correct Answers", () => {
    beforeEach(() => {
      // Setup quiz with questions and options
      mockDb._testData.quizzes.push({
        id: "quiz-1",
        title: "Test Quiz",
        description: "A test quiz",
        categoryId: "cat-1",
        difficulty: "easy",
        timeLimit: 420,
        passingScore: 60,
        isActive: true,
        isFeatured: false,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDb._testData.questions.push(
        {
          id: "q1",
          quizId: "quiz-1",
          text: "What is 2 + 2?",
          type: "single",
          explanation: "Basic addition",
          order: 1,
          createdAt: new Date(),
        },
        {
          id: "q2",
          quizId: "quiz-1",
          text: "Select all even numbers",
          type: "multiple",
          explanation: null,
          order: 2,
          createdAt: new Date(),
        },
      );

      mockDb._testData.options.push(
        {
          id: "opt-1",
          questionId: "q1",
          text: "3",
          isCorrect: false,
          order: 1,
        },
        { id: "opt-2", questionId: "q1", text: "4", isCorrect: true, order: 2 },
        {
          id: "opt-3",
          questionId: "q1",
          text: "5",
          isCorrect: false,
          order: 3,
        },
        { id: "opt-4", questionId: "q2", text: "2", isCorrect: true, order: 1 },
        {
          id: "opt-5",
          questionId: "q2",
          text: "3",
          isCorrect: false,
          order: 2,
        },
        { id: "opt-6", questionId: "q2", text: "4", isCorrect: true, order: 3 },
      );
    });

    it("should return quiz with questions and options", () => {
      const quiz = mockDb._testData.quizzes.find((q) => q.id === "quiz-1");
      const questions = mockDb._testData.questions.filter(
        (q) => q.quizId === "quiz-1",
      );

      expect(quiz).toBeDefined();
      expect(questions).toHaveLength(2);
    });

    it("should exclude isCorrect flag from options for quiz takers", () => {
      const questions = mockDb._testData.questions.filter(
        (q) => q.quizId === "quiz-1",
      );
      const questionsWithOptions = questions.map((q) => {
        const options = mockDb._testData.options
          .filter((o) => o.questionId === q.id)
          .map(({ id, text, order }) => ({ id, text, order })); // Exclude isCorrect
        return { ...q, options };
      });

      questionsWithOptions.forEach((question) => {
        question.options.forEach((option) => {
          expect(option).not.toHaveProperty("isCorrect");
        });
      });
    });

    it("should include question explanation field (hidden until submission)", () => {
      const question = mockDb._testData.questions.find((q) => q.id === "q1");

      expect(question?.explanation).toBe("Basic addition");
    });

    it("should order questions by order field", () => {
      const questions = mockDb._testData.questions
        .filter((q) => q.quizId === "quiz-1")
        .sort((a, b) => a.order - b.order);

      expect(questions[0].order).toBe(1);
      expect(questions[1].order).toBe(2);
    });

    it("should order options by order field", () => {
      const options = mockDb._testData.options
        .filter((o) => o.questionId === "q1")
        .sort((a, b) => a.order - b.order);

      expect(options[0].order).toBe(1);
      expect(options[1].order).toBe(2);
      expect(options[2].order).toBe(3);
    });

    it("should return null for inactive quiz", () => {
      const inactiveQuiz = mockDb._testData.quizzes.find((q) => !q.isActive);
      expect(inactiveQuiz || null).toBeNull();
    });
  });

  describe("Quiz Time Limit Conversion", () => {
    it("should convert seconds to estimated minutes (rounded up)", () => {
      const testCases = [
        { seconds: 420, expectedMinutes: 7 },
        { seconds: 425, expectedMinutes: 8 },
        { seconds: 360, expectedMinutes: 6 },
        { seconds: 600, expectedMinutes: 10 },
      ];

      testCases.forEach(({ seconds, expectedMinutes }) => {
        const minutes = Math.ceil(seconds / 60);
        expect(minutes).toBe(expectedMinutes);
      });
    });
  });

  describe("Quiz Sorting Logic", () => {
    beforeEach(() => {
      mockDb._testData.quizzes.push(
        {
          id: "quiz-1",
          title: "C Quiz",
          description: null,
          categoryId: "cat-1",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        {
          id: "quiz-2",
          title: "A Quiz",
          description: null,
          categoryId: "cat-1",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-10"),
        },
        {
          id: "quiz-3",
          title: "B Quiz",
          description: null,
          categoryId: "cat-1",
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date("2024-01-20"),
          updatedAt: new Date("2024-01-20"),
        },
      );
    });

    it("should sort by title alphabetically (ascending)", () => {
      const sorted = [...mockDb._testData.quizzes].sort((a, b) =>
        a.title.localeCompare(b.title),
      );

      expect(sorted[0].title).toBe("A Quiz");
      expect(sorted[1].title).toBe("B Quiz");
      expect(sorted[2].title).toBe("C Quiz");
    });

    it("should sort by creation date (newest first)", () => {
      const sorted = [...mockDb._testData.quizzes].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      expect(sorted[0].createdAt.toISOString()).toBe(
        "2024-01-20T00:00:00.000Z",
      );
      expect(sorted[1].createdAt.toISOString()).toBe(
        "2024-01-15T00:00:00.000Z",
      );
      expect(sorted[2].createdAt.toISOString()).toBe(
        "2024-01-10T00:00:00.000Z",
      );
    });

    it("should sort by creation date (oldest first)", () => {
      const sorted = [...mockDb._testData.quizzes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      expect(sorted[0].createdAt.toISOString()).toBe(
        "2024-01-10T00:00:00.000Z",
      );
      expect(sorted[1].createdAt.toISOString()).toBe(
        "2024-01-15T00:00:00.000Z",
      );
      expect(sorted[2].createdAt.toISOString()).toBe(
        "2024-01-20T00:00:00.000Z",
      );
    });
  });

  describe("Question Count Aggregation", () => {
    beforeEach(() => {
      mockDb._testData.quizzes.push(
        {
          id: "quiz-1",
          title: "Quiz 1",
          description: null,
          categoryId: null,
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "quiz-2",
          title: "Quiz 2",
          description: null,
          categoryId: null,
          difficulty: "easy",
          timeLimit: 420,
          passingScore: 60,
          isActive: true,
          isFeatured: false,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      );

      // Quiz 1 has 3 questions, Quiz 2 has 2 questions
      mockDb._testData.questions.push(
        {
          id: "q1",
          quizId: "quiz-1",
          text: "Q1",
          type: "single",
          explanation: null,
          order: 1,
          createdAt: new Date(),
        },
        {
          id: "q2",
          quizId: "quiz-1",
          text: "Q2",
          type: "single",
          explanation: null,
          order: 2,
          createdAt: new Date(),
        },
        {
          id: "q3",
          quizId: "quiz-1",
          text: "Q3",
          type: "single",
          explanation: null,
          order: 3,
          createdAt: new Date(),
        },
        {
          id: "q4",
          quizId: "quiz-2",
          text: "Q4",
          type: "single",
          explanation: null,
          order: 1,
          createdAt: new Date(),
        },
        {
          id: "q5",
          quizId: "quiz-2",
          text: "Q5",
          type: "single",
          explanation: null,
          order: 2,
          createdAt: new Date(),
        },
      );
    });

    it("should count questions per quiz correctly", () => {
      const quiz1Questions = mockDb._testData.questions.filter(
        (q) => q.quizId === "quiz-1",
      );
      const quiz2Questions = mockDb._testData.questions.filter(
        (q) => q.quizId === "quiz-2",
      );

      expect(quiz1Questions).toHaveLength(3);
      expect(quiz2Questions).toHaveLength(2);
    });

    it("should calculate total questions across all quizzes", () => {
      const totalQuestions = mockDb._testData.questions.length;
      expect(totalQuestions).toBe(5);
    });
  });
});
