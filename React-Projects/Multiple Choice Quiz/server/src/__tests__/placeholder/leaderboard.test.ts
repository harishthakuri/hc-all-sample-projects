import { describe, it, expect } from "vitest";

/**
 * Tests for Leaderboard Ranking Logic
 * Critical for ensuring fair and accurate ranking of quiz participants
 */

describe("Leaderboard Ranking - Score-based", () => {
  interface LeaderboardEntry {
    userId: string;
    score: number;
    timeTaken: number;
  }

  /**
   * Sort entries by score (descending), then by time (ascending) for ties
   */
  const rankEntries = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
    return [...entries].sort((a, b) => {
      // Primary: Higher score wins
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary: Faster time wins (lower is better)
      return a.timeTaken - b.timeTaken;
    });
  };

  it("should rank by score (highest first)", () => {
    const entries: LeaderboardEntry[] = [
      { userId: "1", score: 75, timeTaken: 300 },
      { userId: "2", score: 90, timeTaken: 400 },
      { userId: "3", score: 60, timeTaken: 200 },
    ];

    const ranked = rankEntries(entries);

    expect(ranked[0].userId).toBe("2"); // 90 score
    expect(ranked[1].userId).toBe("1"); // 75 score
    expect(ranked[2].userId).toBe("3"); // 60 score
  });

  it("should use time as tiebreaker when scores are equal", () => {
    const entries: LeaderboardEntry[] = [
      { userId: "1", score: 80, timeTaken: 500 },
      { userId: "2", score: 80, timeTaken: 300 },
      { userId: "3", score: 80, timeTaken: 400 },
    ];

    const ranked = rankEntries(entries);

    expect(ranked[0].userId).toBe("2"); // Same score, fastest time (300s)
    expect(ranked[1].userId).toBe("3"); // Same score, medium time (400s)
    expect(ranked[2].userId).toBe("1"); // Same score, slowest time (500s)
  });

  it("should handle perfect score scenarios", () => {
    const entries: LeaderboardEntry[] = [
      { userId: "1", score: 100, timeTaken: 600 },
      { userId: "2", score: 100, timeTaken: 450 },
      { userId: "3", score: 95, timeTaken: 300 },
    ];

    const ranked = rankEntries(entries);

    expect(ranked[0].userId).toBe("2"); // 100 score, faster
    expect(ranked[1].userId).toBe("1"); // 100 score, slower
    expect(ranked[2].userId).toBe("3"); // 95 score
  });

  it("should handle all same scores and times", () => {
    const entries: LeaderboardEntry[] = [
      { userId: "1", score: 70, timeTaken: 400 },
      { userId: "2", score: 70, timeTaken: 400 },
      { userId: "3", score: 70, timeTaken: 400 },
    ];

    const ranked = rankEntries(entries);

    // All should be tied - order preserved from original
    expect(ranked).toHaveLength(3);
    expect(ranked.every((e) => e.score === 70 && e.timeTaken === 400)).toBe(
      true,
    );
  });

  it("should handle single entry", () => {
    const entries: LeaderboardEntry[] = [
      { userId: "1", score: 85, timeTaken: 500 },
    ];

    const ranked = rankEntries(entries);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].userId).toBe("1");
  });

  it("should handle empty leaderboard", () => {
    const entries: LeaderboardEntry[] = [];
    const ranked = rankEntries(entries);
    expect(ranked).toHaveLength(0);
  });
});

describe("Leaderboard Rank Assignment", () => {
  interface Entry {
    userId: string;
    score: number;
  }

  it("should assign sequential ranks", () => {
    const entries: Entry[] = [
      { userId: "1", score: 90 },
      { userId: "2", score: 80 },
      { userId: "3", score: 70 },
    ];

    const ranked = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
    expect(ranked[2].rank).toBe(3);
  });

  it("should handle ties with same rank (Olympic-style)", () => {
    // In Olympic ranking, ties get same rank, next rank is skipped
    const scores = [100, 90, 90, 80];
    const ranks: number[] = [];

    scores.forEach((score, index) => {
      if (index === 0 || scores[index - 1] !== score) {
        ranks.push(index + 1);
      } else {
        ranks.push(ranks[ranks.length - 1]);
      }
    });

    expect(ranks).toEqual([1, 2, 2, 4]); // Note: 3 is skipped
  });

  it("should handle dense ranking (consecutive ranks)", () => {
    // In dense ranking, ties get same rank, next rank is consecutive
    const scores = [100, 90, 90, 80];
    const ranks: number[] = [];
    let currentRank = 1;

    scores.forEach((score, index) => {
      if (index > 0 && scores[index - 1] !== score) {
        currentRank++;
      }
      ranks.push(currentRank);
    });

    expect(ranks).toEqual([1, 2, 2, 3]); // Consecutive ranks
  });
});

describe("Global Leaderboard Aggregation", () => {
  interface UserAttempt {
    userId: string;
    score: number;
  }

  it("should calculate average score per user", () => {
    const attempts: UserAttempt[] = [
      { userId: "user1", score: 80 },
      { userId: "user1", score: 90 },
      { userId: "user2", score: 70 },
      { userId: "user2", score: 80 },
    ];

    const aggregated = new Map<string, { totalScore: number; count: number }>();

    attempts.forEach((attempt) => {
      const current = aggregated.get(attempt.userId) || {
        totalScore: 0,
        count: 0,
      };
      aggregated.set(attempt.userId, {
        totalScore: current.totalScore + attempt.score,
        count: current.count + 1,
      });
    });

    const user1Avg =
      aggregated.get("user1")!.totalScore / aggregated.get("user1")!.count;
    const user2Avg =
      aggregated.get("user2")!.totalScore / aggregated.get("user2")!.count;

    expect(user1Avg).toBe(85);
    expect(user2Avg).toBe(75);
  });

  it("should count total quizzes completed per user", () => {
    const attempts = [
      { userId: "user1", quizId: "quiz1" },
      { userId: "user1", quizId: "quiz2" },
      { userId: "user1", quizId: "quiz1" }, // Duplicate quiz
      { userId: "user2", quizId: "quiz1" },
    ];

    const quizCounts = new Map<string, Set<string>>();

    attempts.forEach((attempt) => {
      if (!quizCounts.has(attempt.userId)) {
        quizCounts.set(attempt.userId, new Set());
      }
      quizCounts.get(attempt.userId)!.add(attempt.quizId);
    });

    expect(quizCounts.get("user1")!.size).toBe(2); // 2 unique quizzes
    expect(quizCounts.get("user2")!.size).toBe(1); // 1 unique quiz
  });

  it("should calculate total score across all attempts", () => {
    const attempts = [
      { userId: "user1", score: 80 },
      { userId: "user1", score: 90 },
      { userId: "user1", score: 70 },
    ];

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0,
    );
    expect(totalScore).toBe(240);
  });
});

describe("Leaderboard Pagination", () => {
  it("should limit results to top N entries", () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({
      userId: `user${i}`,
      score: 100 - i,
    }));

    const limit = 10;
    const topEntries = entries.slice(0, limit);

    expect(topEntries).toHaveLength(10);
    expect(topEntries[0].score).toBe(100);
    expect(topEntries[9].score).toBe(91);
  });

  it("should handle limit greater than total entries", () => {
    const entries = [
      { userId: "1", score: 90 },
      { userId: "2", score: 80 },
    ];

    const limit = 10;
    const topEntries = entries.slice(0, limit);

    expect(topEntries).toHaveLength(2);
  });
});

describe("Leaderboard Filtering", () => {
  interface Entry {
    userId: string;
    score: number;
    status: "completed" | "in_progress";
  }

  it("should only include completed attempts", () => {
    const entries: Entry[] = [
      { userId: "1", score: 90, status: "completed" },
      { userId: "2", score: 85, status: "in_progress" },
      { userId: "3", score: 80, status: "completed" },
    ];

    const completed = entries.filter((e) => e.status === "completed");
    expect(completed).toHaveLength(2);
    expect(completed.every((e) => e.status === "completed")).toBe(true);
  });

  it("should filter out zero scores", () => {
    const entries = [
      { userId: "1", score: 90 },
      { userId: "2", score: 0 },
      { userId: "3", score: 75 },
    ];

    const validScores = entries.filter((e) => e.score > 0);
    expect(validScores).toHaveLength(2);
  });
});

describe("Score Precision", () => {
  it("should handle decimal scores correctly", () => {
    const entries = [{ score: 85.67 }, { score: 85.66 }, { score: 85.68 }];

    const sorted = [...entries].sort((a, b) => b.score - a.score);

    expect(sorted[0].score).toBe(85.68);
    expect(sorted[1].score).toBe(85.67);
    expect(sorted[2].score).toBe(85.66);
  });

  it("should round scores to 2 decimal places for display", () => {
    const score = 85.6789;
    const rounded = Number(score.toFixed(2));
    expect(rounded).toBe(85.68);
  });
});
