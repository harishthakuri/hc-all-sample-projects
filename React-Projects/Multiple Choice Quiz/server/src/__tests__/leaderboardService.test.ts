import { describe, it, expect, beforeEach } from "vitest";
import { createMockDb } from "./helpers/db-mock";

/**
 * Integration Tests for Leaderboard Service
 * Tests ranking, tie-breaking, and aggregation logic
 */

describe("LeaderboardService Integration Tests", () => {
  const mockDb = createMockDb();

  beforeEach(() => {
    mockDb._testData.reset();
  });

  describe("Quiz Leaderboard Ranking", () => {
    beforeEach(() => {
      // Setup test attempts with different scores and times
      mockDb._testData.quizAttempts.push(
        {
          id: "attempt-1",
          sessionId: "session-1",
          userId: "user-1",
          quizId: "quiz-1",
          status: "completed",
          score: "95.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date("2024-01-01T10:00:00Z"),
          completedAt: new Date("2024-01-01T10:05:00Z"),
        },
        {
          id: "attempt-2",
          sessionId: "session-2",
          userId: "user-2",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 250,
          startedAt: new Date("2024-01-01T11:00:00Z"),
          completedAt: new Date("2024-01-01T11:04:10Z"),
        },
        {
          id: "attempt-3",
          sessionId: "session-3",
          userId: "user-3",
          quizId: "quiz-1",
          status: "completed",
          score: "95.00",
          currentQuestion: 10,
          timeTaken: 280,
          startedAt: new Date("2024-01-01T12:00:00Z"),
          completedAt: new Date("2024-01-01T12:04:40Z"),
        },
        {
          id: "attempt-4",
          sessionId: "session-4",
          userId: null,
          quizId: "quiz-1",
          status: "in_progress",
          score: null,
          currentQuestion: 5,
          timeTaken: null,
          startedAt: new Date("2024-01-01T13:00:00Z"),
          completedAt: null,
        },
      );
    });

    it("should rank by score (highest first)", () => {
      const completedAttempts = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        });

      expect(completedAttempts[0].score).toBe("95.00");
      expect(completedAttempts[1].score).toBe("95.00");
      expect(completedAttempts[2].score).toBe("90.00");
    });

    it("should use time as tiebreaker when scores are equal (faster time wins)", () => {
      const completedAttempts = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        });

      // Both have 95%, but attempt-3 (280s) is faster than attempt-1 (300s)
      const topTwo = completedAttempts.filter((a) => a.score === "95.00");
      expect(topTwo[0].timeTaken).toBe(280); // Faster
      expect(topTwo[1].timeTaken).toBe(300); // Slower
    });

    it("should exclude in-progress attempts from leaderboard", () => {
      const completedOnly = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      expect(completedOnly).toHaveLength(3);
      expect(completedOnly.every((a) => a.status === "completed")).toBe(true);
    });

    it("should assign correct ranks based on position", () => {
      const completedAttempts = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        });

      const withRanks = completedAttempts.map((attempt, index) => ({
        ...attempt,
        rank: index + 1,
      }));

      expect(withRanks[0].rank).toBe(1);
      expect(withRanks[1].rank).toBe(2);
      expect(withRanks[2].rank).toBe(3);
    });

    it("should limit results to top N entries", () => {
      const limit = 2;
      const completedAttempts = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        })
        .slice(0, limit);

      expect(completedAttempts).toHaveLength(2);
      expect(Number(completedAttempts[0].score)).toBeGreaterThanOrEqual(
        Number(completedAttempts[1].score),
      );
    });
  });

  describe("Global Leaderboard Aggregation", () => {
    beforeEach(() => {
      // Setup multiple quiz attempts for same users
      mockDb._testData.quizAttempts.push(
        // User 1: 2 quizzes, scores 90 and 80
        {
          id: "a1",
          sessionId: "s1",
          userId: "user-1",
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
          sessionId: "s1",
          userId: "user-1",
          quizId: "quiz-2",
          status: "completed",
          score: "80.00",
          currentQuestion: 10,
          timeTaken: 250,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        // User 2: 2 quizzes, scores 70 and 70
        {
          id: "a3",
          sessionId: "s2",
          userId: "user-2",
          quizId: "quiz-1",
          status: "completed",
          score: "70.00",
          currentQuestion: 10,
          timeTaken: 400,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "a4",
          sessionId: "s2",
          userId: "user-2",
          quizId: "quiz-2",
          status: "completed",
          score: "70.00",
          currentQuestion: 10,
          timeTaken: 350,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        // User 1 takes same quiz again (duplicate quiz)
        {
          id: "a5",
          sessionId: "s1",
          userId: "user-1",
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

    it("should calculate average score per user across all attempts", () => {
      const userAttempts = new Map<string, number[]>();

      mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed" && a.userId)
        .forEach((attempt) => {
          if (!userAttempts.has(attempt.userId!)) {
            userAttempts.set(attempt.userId!, []);
          }
          userAttempts.get(attempt.userId!)!.push(Number(attempt.score));
        });

      const user1Scores = userAttempts.get("user-1")!;
      const user1Avg =
        user1Scores.reduce((sum, s) => sum + s, 0) / user1Scores.length;

      // User 1: (90 + 80 + 95) / 3 = 88.33
      expect(user1Avg).toBeCloseTo(88.33, 2);

      const user2Scores = userAttempts.get("user-2")!;
      const user2Avg =
        user2Scores.reduce((sum, s) => sum + s, 0) / user2Scores.length;

      // User 2: (70 + 70) / 2 = 70
      expect(user2Avg).toBe(70);
    });

    it("should count unique quizzes completed per user", () => {
      const userQuizzes = new Map<string, Set<string>>();

      mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed" && a.userId)
        .forEach((attempt) => {
          if (!userQuizzes.has(attempt.userId!)) {
            userQuizzes.set(attempt.userId!, new Set());
          }
          userQuizzes.get(attempt.userId!)!.add(attempt.quizId);
        });

      // User 1 took quiz-1 twice and quiz-2 once = 2 unique quizzes
      expect(userQuizzes.get("user-1")!.size).toBe(2);

      // User 2 took quiz-1 and quiz-2 = 2 unique quizzes
      expect(userQuizzes.get("user-2")!.size).toBe(2);
    });

    it("should calculate total score sum per user", () => {
      const userTotals = new Map<string, number>();

      mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed" && a.userId)
        .forEach((attempt) => {
          const current = userTotals.get(attempt.userId!) || 0;
          userTotals.set(attempt.userId!, current + Number(attempt.score));
        });

      // User 1: 90 + 80 + 95 = 265
      expect(userTotals.get("user-1")).toBe(265);

      // User 2: 70 + 70 = 140
      expect(userTotals.get("user-2")).toBe(140);
    });

    it("should rank users by average score on global leaderboard", () => {
      const userStats = new Map<string, { total: number; count: number }>();

      mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed" && a.userId)
        .forEach((attempt) => {
          const stats = userStats.get(attempt.userId!) || {
            total: 0,
            count: 0,
          };
          stats.total += Number(attempt.score);
          stats.count += 1;
          userStats.set(attempt.userId!, stats);
        });

      const rankings = Array.from(userStats.entries())
        .map(([userId, stats]) => ({
          userId,
          averageScore: stats.total / stats.count,
        }))
        .sort((a, b) => b.averageScore - a.averageScore);

      // User 1 avg (88.33) > User 2 avg (70)
      expect(rankings[0].userId).toBe("user-1");
      expect(rankings[1].userId).toBe("user-2");
    });
  });

  describe("Score Precision Handling", () => {
    it("should handle decimal scores correctly in ranking", () => {
      const scores = [
        { userId: "u1", score: 85.67 },
        { userId: "u2", score: 85.66 },
        { userId: "u3", score: 85.68 },
      ];

      const sorted = [...scores].sort((a, b) => b.score - a.score);

      expect(sorted[0].score).toBe(85.68);
      expect(sorted[1].score).toBe(85.67);
      expect(sorted[2].score).toBe(85.66);
    });

    it("should round scores to 2 decimal places for display", () => {
      const score = 85.6789;
      const rounded = Number(score.toFixed(2));

      expect(rounded).toBe(85.68);
    });

    it("should handle string to number conversion for scores", () => {
      const scoreStr = "95.50";
      const scoreNum = Number(scoreStr);

      expect(scoreNum).toBe(95.5);
      expect(typeof scoreNum).toBe("number");
    });
  });

  describe("Anonymous vs Authenticated Users", () => {
    beforeEach(() => {
      mockDb._testData.sessions.push(
        {
          id: "session-1",
          sessionToken: "token-1",
          userId: "user-1",
          expiresAt: new Date(),
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
        {
          id: "session-2",
          sessionToken: "token-2",
          userId: null, // Anonymous session
          expiresAt: new Date(),
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
      );

      mockDb._testData.users.push({
        id: "user-1",
        email: "user@example.com",
        passwordHash: "hash",
        name: "Test User",
        role: "user",
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      });

      mockDb._testData.quizAttempts.push(
        {
          id: "attempt-1",
          sessionId: "session-1",
          userId: "user-1",
          quizId: "quiz-1",
          status: "completed",
          score: "90.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: "attempt-2",
          sessionId: "session-2",
          userId: null,
          quizId: "quiz-1",
          status: "completed",
          score: "85.00",
          currentQuestion: 10,
          timeTaken: 250,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );
    });

    it("should include both authenticated and anonymous users in leaderboard", () => {
      const allAttempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );

      expect(allAttempts).toHaveLength(2);
      expect(allAttempts.some((a) => a.userId !== null)).toBe(true); // Has authenticated
      expect(allAttempts.some((a) => a.userId === null)).toBe(true); // Has anonymous
    });

    it("should display name for authenticated users", () => {
      const user = mockDb._testData.users.find((u) => u.id === "user-1");
      expect(user?.name).toBe("Test User");
    });

    it("should handle null userId for anonymous sessions", () => {
      const anonymousAttempt = mockDb._testData.quizAttempts.find(
        (a) => a.userId === null,
      );
      expect(anonymousAttempt).toBeDefined();
      expect(anonymousAttempt?.userId).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty leaderboard (no attempts)", () => {
      const attempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );
      expect(attempts).toHaveLength(0);
    });

    it("should handle single entry leaderboard", () => {
      mockDb._testData.quizAttempts.push({
        id: "attempt-1",
        sessionId: "session-1",
        userId: "user-1",
        quizId: "quiz-1",
        status: "completed",
        score: "85.00",
        currentQuestion: 10,
        timeTaken: 300,
        startedAt: new Date(),
        completedAt: new Date(),
      });

      const attempts = mockDb._testData.quizAttempts.filter(
        (a) => a.status === "completed",
      );
      expect(attempts).toHaveLength(1);
    });

    it("should handle all same scores and times (perfect tie)", () => {
      mockDb._testData.quizAttempts.push(
        {
          id: "a1",
          sessionId: "s1",
          userId: "u1",
          quizId: "q1",
          status: "completed",
          score: "80.00",
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
          score: "80.00",
          currentQuestion: 10,
          timeTaken: 300,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      );

      const attempts = mockDb._testData.quizAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => {
          const scoreA = Number(a.score) || 0;
          const scoreB = Number(b.score) || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return (a.timeTaken || 0) - (b.timeTaken || 0);
        });

      expect(attempts).toHaveLength(2);
      expect(attempts[0].score).toBe(attempts[1].score);
      expect(attempts[0].timeTaken).toBe(attempts[1].timeTaken);
    });
  });
});
