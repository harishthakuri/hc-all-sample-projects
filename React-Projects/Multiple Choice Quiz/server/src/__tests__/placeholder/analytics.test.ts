import { describe, it, expect } from "vitest";

/**
 * Tests for Analytics and Statistical Calculations
 * Critical for accurate reporting and insights
 */

describe("Analytics - Score Statistics", () => {
  interface Attempt {
    score: number;
    status: "completed" | "in_progress";
  }

  const completedAttempts: Attempt[] = [
    { score: 90, status: "completed" },
    { score: 75, status: "completed" },
    { score: 85, status: "completed" },
    { score: 60, status: "completed" },
    { score: 95, status: "completed" },
  ];

  it("should calculate average score correctly", () => {
    const scores = completedAttempts.map((a) => a.score);
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    expect(average).toBe(81); // (90+75+85+60+95)/5 = 81
  });

  it("should find highest score", () => {
    const scores = completedAttempts.map((a) => a.score);
    const highest = Math.max(...scores);

    expect(highest).toBe(95);
  });

  it("should find lowest score", () => {
    const scores = completedAttempts.map((a) => a.score);
    const lowest = Math.min(...scores);

    expect(lowest).toBe(60);
  });

  it("should handle empty attempts list", () => {
    const scores: number[] = [];
    const average =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    expect(average).toBe(0);
  });

  it("should handle single attempt", () => {
    const scores = [85];
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    expect(average).toBe(85);
  });

  it("should round average to 2 decimal places", () => {
    const scores = [85, 90, 77];
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const rounded = Number(average.toFixed(2));

    expect(rounded).toBe(84); // 252/3 = 84
  });
});

describe("Analytics - Pass Rate Calculation", () => {
  interface Attempt {
    score: number;
    status: "completed" | "in_progress";
  }

  it("should calculate pass rate correctly", () => {
    const passingScore = 70;
    const attempts: Attempt[] = [
      { score: 90, status: "completed" },
      { score: 60, status: "completed" },
      { score: 75, status: "completed" },
      { score: 65, status: "completed" },
      { score: 80, status: "completed" },
    ];

    const completed = attempts.filter((a) => a.status === "completed");
    const passed = completed.filter((a) => a.score >= passingScore);
    const passRate = (passed.length / completed.length) * 100;

    expect(passRate).toBe(60); // 3 out of 5 passed = 60%
  });

  it("should handle 100% pass rate", () => {
    const passingScore = 60;
    const attempts: Attempt[] = [
      { score: 90, status: "completed" },
      { score: 85, status: "completed" },
      { score: 75, status: "completed" },
    ];

    const passed = attempts.filter((a) => a.score >= passingScore);
    const passRate = (passed.length / attempts.length) * 100;

    expect(passRate).toBe(100);
  });

  it("should handle 0% pass rate", () => {
    const passingScore = 80;
    const attempts: Attempt[] = [
      { score: 60, status: "completed" },
      { score: 55, status: "completed" },
      { score: 70, status: "completed" },
    ];

    const passed = attempts.filter((a) => a.score >= passingScore);
    const passRate = (passed.length / attempts.length) * 100;

    expect(passRate).toBe(0);
  });

  it("should handle boundary cases (exact passing score)", () => {
    const passingScore = 70;
    const attempts: Attempt[] = [
      { score: 70, status: "completed" },
      { score: 69, status: "completed" },
    ];

    const passed = attempts.filter((a) => a.score >= passingScore);
    const passRate = (passed.length / attempts.length) * 100;

    expect(passRate).toBe(50); // Only score >= 70 passes
  });
});

describe("Analytics - Completion Rate", () => {
  interface Attempt {
    status: "completed" | "in_progress" | "abandoned";
  }

  it("should calculate completion rate correctly", () => {
    const attempts: Attempt[] = [
      { status: "completed" },
      { status: "completed" },
      { status: "in_progress" },
      { status: "abandoned" },
      { status: "completed" },
    ];

    const totalAttempts = attempts.length;
    const completions = attempts.filter((a) => a.status === "completed").length;
    const completionRate = (completions / totalAttempts) * 100;

    expect(completionRate).toBe(60); // 3 out of 5 = 60%
  });

  it("should handle all completed", () => {
    const attempts: Attempt[] = [
      { status: "completed" },
      { status: "completed" },
    ];

    const completions = attempts.filter((a) => a.status === "completed").length;
    const completionRate = (completions / attempts.length) * 100;

    expect(completionRate).toBe(100);
  });

  it("should handle no completions", () => {
    const attempts: Attempt[] = [
      { status: "in_progress" },
      { status: "abandoned" },
    ];

    const completions = attempts.filter((a) => a.status === "completed").length;
    const completionRate =
      attempts.length > 0 ? (completions / attempts.length) * 100 : 0;

    expect(completionRate).toBe(0);
  });
});

describe("Analytics - Score Distribution", () => {
  it("should categorize scores into ranges", () => {
    const scores = [15, 35, 55, 75, 95, 25, 45, 65, 85, 10];

    const distribution = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };

    scores.forEach((score) => {
      if (score <= 20) distribution["0-20"]++;
      else if (score <= 40) distribution["21-40"]++;
      else if (score <= 60) distribution["41-60"]++;
      else if (score <= 80) distribution["61-80"]++;
      else distribution["81-100"]++;
    });

    expect(distribution["0-20"]).toBe(2); // 15, 10
    expect(distribution["21-40"]).toBe(2); // 35, 25
    expect(distribution["41-60"]).toBe(2); // 55, 45
    expect(distribution["61-80"]).toBe(2); // 75, 65
    expect(distribution["81-100"]).toBe(2); // 95, 85
  });

  it("should handle boundary values correctly", () => {
    const scores = [20, 40, 60, 80, 100];

    const inRange = (score: number, min: number, max: number) =>
      score >= min && score <= max;

    expect(inRange(20, 0, 20)).toBe(true);
    expect(inRange(20, 21, 40)).toBe(false);
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

describe("Analytics - Average Time Calculation", () => {
  interface Attempt {
    timeTaken: number; // in seconds
  }

  it("should calculate average time taken", () => {
    const attempts: Attempt[] = [
      { timeTaken: 300 }, // 5 minutes
      { timeTaken: 420 }, // 7 minutes
      { timeTaken: 360 }, // 6 minutes
    ];

    const averageSeconds =
      attempts.reduce((sum, a) => sum + a.timeTaken, 0) / attempts.length;

    expect(averageSeconds).toBe(360); // 6 minutes average
  });

  it("should convert average time to minutes", () => {
    const averageSeconds = 450;
    const averageMinutes = Math.round(averageSeconds / 60);

    expect(averageMinutes).toBe(8);
  });

  it("should handle edge cases", () => {
    const attempts: Attempt[] = [{ timeTaken: 0 }];

    const averageSeconds =
      attempts.reduce((sum, a) => sum + a.timeTaken, 0) / attempts.length;
    expect(averageSeconds).toBe(0);
  });
});

describe("Analytics - Question Performance", () => {
  interface QuestionStats {
    questionId: string;
    correctCount: number;
    totalAttempts: number;
  }

  it("should calculate question success rate", () => {
    const stats: QuestionStats = {
      questionId: "q1",
      correctCount: 75,
      totalAttempts: 100,
    };

    const successRate = (stats.correctCount / stats.totalAttempts) * 100;
    expect(successRate).toBe(75);
  });

  it("should identify difficult questions (low success rate)", () => {
    const questions: QuestionStats[] = [
      { questionId: "q1", correctCount: 85, totalAttempts: 100 },
      { questionId: "q2", correctCount: 40, totalAttempts: 100 },
      { questionId: "q3", correctCount: 70, totalAttempts: 100 },
    ];

    const difficultThreshold = 50; // Less than 50% success rate

    const difficultQuestions = questions.filter(
      (q) => (q.correctCount / q.totalAttempts) * 100 < difficultThreshold,
    );

    expect(difficultQuestions).toHaveLength(1);
    expect(difficultQuestions[0].questionId).toBe("q2");
  });
});

describe("Analytics - Trend Analysis", () => {
  interface DailyStats {
    date: string;
    attempts: number;
  }

  it("should aggregate attempts by date", () => {
    const attempts = [
      { date: "2024-01-01" },
      { date: "2024-01-01" },
      { date: "2024-01-02" },
      { date: "2024-01-01" },
      { date: "2024-01-03" },
    ];

    const aggregated = new Map<string, number>();
    attempts.forEach((attempt) => {
      aggregated.set(attempt.date, (aggregated.get(attempt.date) || 0) + 1);
    });

    expect(aggregated.get("2024-01-01")).toBe(3);
    expect(aggregated.get("2024-01-02")).toBe(1);
    expect(aggregated.get("2024-01-03")).toBe(1);
  });

  it("should calculate growth rate", () => {
    const previousPeriod = 80;
    const currentPeriod = 100;

    const growthRate =
      ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    expect(growthRate).toBe(25); // 25% growth
  });

  it("should handle negative growth", () => {
    const previousPeriod = 100;
    const currentPeriod = 75;

    const growthRate =
      ((currentPeriod - previousPeriod) / previousPeriod) * 100;
    expect(growthRate).toBe(-25); // 25% decline
  });
});

describe("Analytics - Percentile Calculations", () => {
  it("should calculate median (50th percentile)", () => {
    const scores = [60, 70, 75, 80, 90].sort((a, b) => a - b);
    const median = scores[Math.floor(scores.length / 2)];

    expect(median).toBe(75);
  });

  it("should handle even number of scores for median", () => {
    const scores = [60, 70, 80, 90].sort((a, b) => a - b);
    const mid = scores.length / 2;
    const median = (scores[mid - 1] + scores[mid]) / 2;

    expect(median).toBe(75); // (70 + 80) / 2
  });

  it("should find percentile rank of a score", () => {
    const scores = [60, 65, 70, 75, 80, 85, 90, 95, 100];
    const targetScore = 80;

    const rank = scores.filter((s) => s < targetScore).length;
    const percentile = (rank / scores.length) * 100;

    expect(percentile).toBeCloseTo(44.44, 1); // 4 out of 9 scores below 80
  });
});
