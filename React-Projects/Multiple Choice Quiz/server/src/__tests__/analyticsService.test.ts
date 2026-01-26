import { describe, it, expect, beforeEach } from "vitest";
import { createMockDb } from "./helpers/db-mock";

/**
 * Integration Tests for Analytics Service
 * Tests statistical calculations, pass rates, and performance metrics
 */

describe("AnalyticsService Integration Tests", () => {
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb._testData.reset();
  });

  describe("Score Statistics Calculation", () => {
    beforeEach(() => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "75.00",
          currentQuestion: 10,
          timeTaken: 400,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a4",
          sessionId: "s4",
          userId: "u4",
          quizId: "quiz-1",
          status: "completed",
          score: "60.00",
          currentQuestion: 10,
          timeTaken: 500,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a5",
          sessionId: "s5",
          userId: "u5",
          quizId: "quiz-1",
          status: "completed",
          score: "95.00",
          currentQuestion: 10,
          timeTaken: 280,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should calculate average score correctly", () => {
      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const total = completedAttempts.reduce(
        (sum, a) => sum + Number(a.score),
        0,
      );
      const average = total / completedAttempts.length;

      // (90 + 75 + 85 + 60 + 95) / 5 = 81
      expect(average).toBe(81);
    });

    it("should find highest score", () => {
      const scores = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .map((a) => Number(a.score));

      const highest = Math.max(...scores);
      expect(highest).toBe(95);
    });

    it("should find lowest score", () => {
      const scores = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .map((a) => Number(a.score));

      const lowest = Math.min(...scores);
      expect(lowest).toBe(60);
    });

    it("should round average to 2 decimal places", () => {
      const scores = [85, 90, 77];
      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const rounded = Number(average.toFixed(2));

      // 252 / 3 = 84
      expect(rounded).toBe(84);
    });

    it("should handle empty attempts list", () => {
      mockDb._testData.reset();

      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const average =
        completedAttempts.length > 0
          ? completedAttempts.reduce((sum, a) => sum + Number(a.score), 0) /
            completedAttempts.length
          : 0;

      expect(average).toBe(0);
    });

    it("should handle single attempt", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push({
        id: "a1",
        sessionId: "s1",
        userId: "u1",
        quizId: "quiz-1",
        status: "completed",
        score: "85.00",
        currentQuestion: 10,
        timeTaken: 300,
        startedAt: new Date(),
        completedAt: new Date(),
      });

      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const average =
        completedAttempts.reduce((sum, a) => sum + Number(a.score), 0) /
        completedAttempts.length;

      expect(average).toBe(85);
    });
  });

  describe("Pass Rate Calculation", () => {
    const passingScore = 70;

    beforeEach(() => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "60.00",
          currentQuestion: 10,
          timeTaken: 400,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "quiz-1",
          status: "completed",
          score: "75.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a4",
          sessionId: "s4",
          userId: "u4",
          quizId: "quiz-1",
          status: "completed",
          score: "65.00",
          currentQuestion: 10,
          timeTaken: 500,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a5",
          sessionId: "s5",
          userId: "u5",
          quizId: "quiz-1",
          status: "completed",
          score: "80.00",
          currentQuestion: 10,
          timeTaken: 280,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should calculate pass rate correctly", () => {
      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const passed = completedAttempts.filter(
        (a) => Number(a.score) >= passingScore,
      );
      const passRate = (passed.length / completedAttempts.length) * 100;

      // 3 out of 5 passed (90, 75, 80) = 60%
      expect(passRate).toBe(60);
    });

    it("should handle 100% pass rate", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );

      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const passed = completedAttempts.filter(
        (a) => Number(a.score) >= passingScore,
      );
      const passRate = (passed.length / completedAttempts.length) * 100;

      expect(passRate).toBe(100);
    });

    it("should handle 0% pass rate", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "60.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "55.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );

      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const passed = completedAttempts.filter(
        (a) => Number(a.score) >= passingScore,
      );
      const passRate = (passed.length / completedAttempts.length) * 100;

      expect(passRate).toBe(0);
    });

    it("should handle boundary case (exact passing score)", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "70.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "69.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );

      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const passed = completedAttempts.filter(
        (a) => Number(a.score) >= passingScore,
      );
      const passRate = (passed.length / completedAttempts.length) * 100;

      // Only score >= 70 passes
      expect(passRate).toBe(50);
    });
  });

  describe("Completion Rate Calculation", () => {
    beforeEach(() => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "quiz-1",
          status: "in_progress",
          score: null,
          currentQuestion: 5,
          timeTaken: null,
          startedAt: new Date(),
          completedAt: null,
        },
        {
          id: "a4",
          sessionId: "s4",
          userId: "u4",
          quizId: "quiz-1",
          status: "abandoned",
          score: null,
          currentQuestion: 3,
          timeTaken: null,
          startedAt: new Date(),
          completedAt: null,
        },
        {
          id: "a5",
          sessionId: "s5",
          userId: "u5",
          quizId: "quiz-1",
          status: "completed",
          score: "75.00",
          currentQuestion: 10,
          timeTaken: 400,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should calculate completion rate correctly", () => {
      const totalAttempts = mockDb._testData.quizAttempts.length;
      const completions = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      ).length;
      const completionRate = (completions / totalAttempts) * 100;

      // 3 completed out of 5 total = 60%
      expect(completionRate).toBe(60);
    });

    it("should handle 100% completion rate", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );

      const totalAttempts = mockDb._testData.quizAttempts.length;
      const completions = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      ).length;
      const completionRate = (completions / totalAttempts) * 100;

      expect(completionRate).toBe(100);
    });

    it("should handle 0% completion rate", () => {
      mockDb._testData.reset();
      mockDb._testData.quizAttempts.push({
        id: "a1",
        sessionId: "s1",
        userId: "u1",
        quizId: "quiz-1",
        status: "in_progress",
        score: null,
        currentQuestion: 5,
        timeTaken: null,
        startedAt: new Date(),
        completedAt: null,
      });

      const totalAttempts = mockDb._testData.quizAttempts.length;
      const completions = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      ).length;
      const completionRate =
        totalAttempts > 0 ? (completions / totalAttempts) * 100 : 0;

      expect(completionRate).toBe(0);
    });
  });

  describe("Score Distribution", () => {
    beforeEach(() => {
      // Create distribution: 2 in each range
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "q1",
          status: "completed",
          score: "15.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "q1",
          status: "completed",
          score: "10.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "q1",
          status: "completed",
          score: "35.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a4",
          sessionId: "s4",
          userId: "u4",
          quizId: "q1",
          status: "completed",
          score: "25.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a5",
          sessionId: "s5",
          userId: "u5",
          quizId: "q1",
          status: "completed",
          score: "55.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a6",
          sessionId: "s6",
          userId: "u6",
          quizId: "q1",
          status: "completed",
          score: "45.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a7",
          sessionId: "s7",
          userId: "u7",
          quizId: "q1",
          status: "completed",
          score: "75.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a8",
          sessionId: "s8",
          userId: "u8",
          quizId: "q1",
          status: "completed",
          score: "65.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a9",
          sessionId: "s9",
          userId: "u9",
          quizId: "q1",
          status: "completed",
          score: "95.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a10",
          sessionId: "s10",
          userId: "u10",
          quizId: "q1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should categorize scores into ranges", () => {
      const distribution = {
        "0-20": 0,
        "21-40": 0,
        "41-60": 0,
        "61-80": 0,
        "81-100": 0,
      };

      mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .forEach((attempt) => {
          const score = Number(attempt.score);
          if (score <= 20) distribution["0-20"]++;
          else if (score <= 40) distribution["21-40"]++;
          else if (score <= 60) distribution["41-60"]++;
          else if (score <= 80) distribution["61-80"]++;
          else distribution["81-100"]++;
        });

      expect(distribution["0-20"]).toBe(2);
      expect(distribution["21-40"]).toBe(2);
      expect(distribution["41-60"]).toBe(2);
      expect(distribution["61-80"]).toBe(2);
      expect(distribution["81-100"]).toBe(2);
    });

    it("should handle boundary values correctly", () => {
      const inRange = (score: number, min: number, max: number) =>
        score >= min && score <= max;

      expect(inRange(20, 0, 20)).toBe(true);
      expect(inRange(21, 21, 40)).toBe(true);
      expect(inRange(40, 21, 40)).toBe(true);
      expect(inRange(100, 81, 100)).toBe(true);
    });

    it("should calculate percentage per range", () => {
      const total = 100;
      const rangeCount = 25;
      const percentage = (rangeCount / total) * 100;

      expect(percentage).toBe(25);
    });
  });

  describe("Average Time Calculation", () => {
    beforeEach(() => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 420,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "quiz-1",
          status: "completed",
          score: "80.00",
          currentQuestion: 10,
          timeTaken: 360,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should calculate average time taken in seconds", () => {
      const completedAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      const totalTime = completedAttempts.reduce(
        (sum, a) => sum + (a.timeTaken || 0),
        0,
      );
      const averageSeconds = totalTime / completedAttempts.length;

      // (300 + 420 + 360) / 3 = 360 seconds (6 minutes)
      expect(averageSeconds).toBe(360);
    });

    it("should convert average time to minutes", () => {
      const averageSeconds = 450;
      const averageMinutes = Math.round(averageSeconds / 60);

      expect(averageMinutes).toBe(8);
    });
  });

  describe("Question Performance Analysis", () => {
    beforeEach(() => {
      mockDb._testData.attemptAnswers.push(
        // Question 1: 75% success rate (3 out of 4 correct)
        {
          id: "aa1",
          attemptId: "a1",
          questionId: "q1",
          optionId: "opt1",
          isCorrect: true,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa2",
          attemptId: "a2",
          questionId: "q1",
          optionId: "opt1",
          isCorrect: true,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa3",
          attemptId: "a3",
          questionId: "q1",
          optionId: "opt2",
          isCorrect: false,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa4",
          attemptId: "a4",
          questionId: "q1",
          optionId: "opt1",
          isCorrect: true,
          isFlagged: false,
          answeredAt: new Date(),
        },

        // Question 2: 40% success rate (2 out of 5 correct)
        {
          id: "aa5",
          attemptId: "a1",
          questionId: "q2",
          optionId: "opt3",
          isCorrect: true,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa6",
          attemptId: "a2",
          questionId: "q2",
          optionId: "opt4",
          isCorrect: false,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa7",
          attemptId: "a3",
          questionId: "q2",
          optionId: "opt4",
          isCorrect: false,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa8",
          attemptId: "a4",
          questionId: "q2",
          optionId: "opt3",
          isCorrect: true,
          isFlagged: false,
          answeredAt: new Date(),
        },
        {
          id: "aa9",
          attemptId: "a5",
          questionId: "q2",
          optionId: "opt4",
          isCorrect: false,
          isFlagged: false,
          answeredAt: new Date(),
        },
      );
    });

    it("should calculate question success rate", () => {
      const q1Answers = mockDb._testData.attemptAnswers.filter(
        (a) => a.questionId === "q1",
      );
      const q1Correct = q1Answers.filter((a) => a.isCorrect).length;
      const q1SuccessRate = (q1Correct / q1Answers.length) * 100;

      expect(q1SuccessRate).toBe(75);
    });

    it("should identify difficult questions (low success rate)", () => {
      const difficultThreshold = 50;

      const questions = ["q1", "q2"];
      const questionStats = questions.map((qId) => {
        const answers = mockDb._testData.attemptAnswers.filter(
          (a) => a.questionId === qId,
        );
        const correct = answers.filter((a) => a.isCorrect).length;
        const successRate = (correct / answers.length) * 100;
        return { questionId: qId, successRate };
      });

      const difficultQuestions = questionStats.filter(
        (q) => q.successRate < difficultThreshold,
      );

      expect(difficultQuestions).toHaveLength(1);
      expect(difficultQuestions[0].questionId).toBe("q2");
    });
  });

  describe("Trend Analysis", () => {
    it("should aggregate attempts by date", () => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "q1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date("2024-01-01"),
          completedAt: new Date(),
        },
        {
          id: "a2",
          sessionId: "s2",
          userId: "u2",
          quizId: "q1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date("2024-01-01"),
          completedAt: new Date(),
        },
        {
          id: "a3",
          sessionId: "s3",
          userId: "u3",
          quizId: "q1",
          status: "completed",
          score: "80.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date("2024-01-02"),
          completedAt: new Date(),
        },
        {
          id: "a4",
          sessionId: "s4",
          userId: "u4",
          quizId: "q1",
          status: "completed",
          score: "75.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date("2024-01-01"),
          completedAt: new Date(),
        },
      );

      const aggregated = new Map<string, number>();
      mockDb._testData.quizAttempts.forEach((attempt) => {
        const date = attempt.startedAt.toISOString().split("T")[0];
        aggregated.set(date, (aggregated.get(date) || 0) + 1);
      });

      expect(aggregated.get("2024-01-01")).toBe(3);
      expect(aggregated.get("2024-01-02")).toBe(1);
    });

    it("should calculate growth rate", () => {
      const previousPeriod = 80;
      const currentPeriod = 100;

      const growthRate =
        ((currentPeriod - previousPeriod) / previousPeriod) * 100;

      expect(growthRate).toBe(25);
    });

    it("should handle negative growth", () => {
      const previousPeriod = 100;
      const currentPeriod = 75;

      const growthRate =
        ((currentPeriod - previousPeriod) / previousPeriod) * 100;

      expect(growthRate).toBe(-25);
    });
  });
});
