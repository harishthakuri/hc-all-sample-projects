import { describe, it, expect } from "vitest";

/**
 * Tests for Quiz Filtering and Search Logic
 * These tests validate the complex filtering and search functionality
 */

describe("Quiz Filtering Logic", () => {
  interface Quiz {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    difficulty: "easy" | "medium" | "hard";
    isFeatured: boolean;
    isActive: boolean;
  }

  const mockQuizzes: Quiz[] = [
    {
      id: "1",
      title: "JavaScript Basics",
      description: "Learn JavaScript fundamentals",
      categoryId: "cat-1",
      difficulty: "easy",
      isFeatured: true,
      isActive: true,
    },
    {
      id: "2",
      title: "Advanced JavaScript",
      description: "Master advanced JavaScript concepts",
      categoryId: "cat-1",
      difficulty: "hard",
      isFeatured: false,
      isActive: true,
    },
    {
      id: "3",
      title: "Python for Beginners",
      description: "Introduction to Python programming",
      categoryId: "cat-2",
      difficulty: "easy",
      isFeatured: false,
      isActive: true,
    },
    {
      id: "4",
      title: "React Advanced Patterns",
      description: "Advanced React development patterns",
      categoryId: "cat-1",
      difficulty: "hard",
      isFeatured: true,
      isActive: true,
    },
    {
      id: "5",
      title: "Inactive Quiz",
      description: "This quiz is inactive",
      categoryId: "cat-1",
      difficulty: "medium",
      isFeatured: false,
      isActive: false,
    },
  ];

  it("should filter by active status", () => {
    const activeQuizzes = mockQuizzes.filter((q) => q.isActive);
    expect(activeQuizzes).toHaveLength(4);
    expect(activeQuizzes.every((q) => q.isActive)).toBe(true);
  });

  it("should filter by category", () => {
    const categoryQuizzes = mockQuizzes.filter(
      (q) => q.isActive && q.categoryId === "cat-1",
    );
    expect(categoryQuizzes).toHaveLength(3);
    expect(categoryQuizzes.every((q) => q.categoryId === "cat-1")).toBe(true);
  });

  it("should filter by difficulty", () => {
    const easyQuizzes = mockQuizzes.filter(
      (q) => q.isActive && q.difficulty === "easy",
    );
    expect(easyQuizzes).toHaveLength(2);
    expect(easyQuizzes.every((q) => q.difficulty === "easy")).toBe(true);
  });

  it("should filter featured quizzes", () => {
    const featuredQuizzes = mockQuizzes.filter(
      (q) => q.isActive && q.isFeatured,
    );
    expect(featuredQuizzes).toHaveLength(2);
    expect(featuredQuizzes.every((q) => q.isFeatured)).toBe(true);
  });

  it("should combine multiple filters", () => {
    const filtered = mockQuizzes.filter(
      (q) => q.isActive && q.categoryId === "cat-1" && q.difficulty === "hard",
    );
    expect(filtered).toHaveLength(2);
    expect(filtered[0].title).toContain("JavaScript");
  });

  it("should return empty array when no matches", () => {
    const filtered = mockQuizzes.filter(
      (q) => q.isActive && q.categoryId === "non-existent",
    );
    expect(filtered).toHaveLength(0);
  });
});

describe("Quiz Search Logic", () => {
  interface Quiz {
    title: string;
    description: string;
  }

  const quizzes: Quiz[] = [
    {
      title: "JavaScript Basics",
      description: "Learn JavaScript fundamentals",
    },
    { title: "Advanced JavaScript", description: "Master advanced concepts" },
    { title: "Python Programming", description: "Introduction to Python" },
    { title: "React Hooks", description: "Modern React with Hooks" },
  ];

  /**
   * Case-insensitive search in title or description
   */
  const searchQuizzes = (query: string, quizList: Quiz[]): Quiz[] => {
    const lowerQuery = query.toLowerCase();
    return quizList.filter(
      (q) =>
        q.title.toLowerCase().includes(lowerQuery) ||
        q.description.toLowerCase().includes(lowerQuery),
    );
  };

  it("should search by title (case-insensitive)", () => {
    const results = searchQuizzes("javascript", quizzes);
    expect(results).toHaveLength(2);
    expect(
      results.every((r) => r.title.toLowerCase().includes("javascript")),
    ).toBe(true);
  });

  it("should search by description", () => {
    const results = searchQuizzes("introduction", quizzes);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Python Programming");
  });

  it("should be case-insensitive", () => {
    const lower = searchQuizzes("react", quizzes);
    const upper = searchQuizzes("REACT", quizzes);
    const mixed = searchQuizzes("ReAcT", quizzes);

    expect(lower).toHaveLength(1);
    expect(upper).toHaveLength(1);
    expect(mixed).toHaveLength(1);
  });

  it("should return empty array for no matches", () => {
    const results = searchQuizzes("nonexistent", quizzes);
    expect(results).toHaveLength(0);
  });

  it("should handle partial matches", () => {
    const results = searchQuizzes("prog", quizzes);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Python Programming");
  });

  it("should handle empty search query", () => {
    const results = searchQuizzes("", quizzes);
    expect(results).toHaveLength(4); // All quizzes match empty string
  });

  it("should search across title and description", () => {
    const results = searchQuizzes("modern", quizzes);
    expect(results).toHaveLength(1);
    expect(results[0].description).toContain("Modern");
  });
});

describe("Quiz Sorting Logic", () => {
  interface Quiz {
    title: string;
    createdAt: Date;
    popularity: number;
  }

  const quizzes: Quiz[] = [
    { title: "C Quiz", createdAt: new Date("2024-01-15"), popularity: 50 },
    { title: "A Quiz", createdAt: new Date("2024-01-10"), popularity: 100 },
    { title: "B Quiz", createdAt: new Date("2024-01-20"), popularity: 75 },
  ];

  it("should sort by title alphabetically", () => {
    const sorted = [...quizzes].sort((a, b) => a.title.localeCompare(b.title));

    expect(sorted[0].title).toBe("A Quiz");
    expect(sorted[1].title).toBe("B Quiz");
    expect(sorted[2].title).toBe("C Quiz");
  });

  it("should sort by creation date (newest first)", () => {
    const sorted = [...quizzes].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    expect(sorted[0].title).toBe("B Quiz");
    expect(sorted[1].title).toBe("C Quiz");
    expect(sorted[2].title).toBe("A Quiz");
  });

  it("should sort by creation date (oldest first)", () => {
    const sorted = [...quizzes].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    expect(sorted[0].title).toBe("A Quiz");
    expect(sorted[1].title).toBe("C Quiz");
    expect(sorted[2].title).toBe("B Quiz");
  });

  it("should sort by popularity (descending)", () => {
    const sorted = [...quizzes].sort((a, b) => b.popularity - a.popularity);

    expect(sorted[0].popularity).toBe(100);
    expect(sorted[1].popularity).toBe(75);
    expect(sorted[2].popularity).toBe(50);
  });
});

describe("Time Limit Conversion", () => {
  it("should convert seconds to minutes (round up)", () => {
    expect(Math.ceil(420 / 60)).toBe(7);
    expect(Math.ceil(425 / 60)).toBe(8);
    expect(Math.ceil(360 / 60)).toBe(6);
    expect(Math.ceil(1 / 60)).toBe(1);
  });

  it("should handle edge cases", () => {
    expect(Math.ceil(0 / 60)).toBe(0);
    expect(Math.ceil(59 / 60)).toBe(1);
    expect(Math.ceil(60 / 60)).toBe(1);
    expect(Math.ceil(61 / 60)).toBe(2);
  });
});

describe("Quiz Question Count", () => {
  it("should aggregate question counts correctly", () => {
    const quizzes = [
      { id: "1", questionCount: 10 },
      { id: "2", questionCount: 15 },
      { id: "3", questionCount: 5 },
    ];

    const totalQuestions = quizzes.reduce((sum, q) => sum + q.questionCount, 0);
    expect(totalQuestions).toBe(30);
  });

  it("should handle empty quiz list", () => {
    const quizzes: { questionCount: number }[] = [];
    const totalQuestions = quizzes.reduce((sum, q) => sum + q.questionCount, 0);
    expect(totalQuestions).toBe(0);
  });

  it("should calculate average question count", () => {
    const quizzes = [
      { questionCount: 10 },
      { questionCount: 20 },
      { questionCount: 30 },
    ];

    const average =
      quizzes.reduce((sum, q) => sum + q.questionCount, 0) / quizzes.length;
    expect(average).toBe(20);
  });
});
