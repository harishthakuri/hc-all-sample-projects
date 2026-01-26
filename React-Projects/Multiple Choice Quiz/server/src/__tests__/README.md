# Test Suite Organization

## Current Structure

```
server/src/__tests__/
├── placeholder/              # Algorithm tests (low value)
│   ├── auth.test.ts
│   ├── scoring.test.ts
│   ├── quiz-filtering.test.ts
│   ├── leaderboard.test.ts
│   └── analytics.test.ts
├── helpers/
│   └── db-mock.ts           # Database mocking utilities
├── authService.test.ts       # Real integration tests (in progress)
└── attemptService.test.ts    # Real integration tests ✓ (23 tests passing)
```

## Placeholder Tests (Low Value) ❌

Located in `__tests__/placeholder/` - These test JavaScript built-in methods, not your code:

- **auth.test.ts** - Tests `bcrypt.hash()`, `crypto.randomUUID()`, `Date` operations
- **scoring.test.ts** - Tests `Array.filter()`, `Math.max()`, arithmetic
- **quiz-filtering.test.ts** - Tests `Array.filter()`, `Array.sort()`, `.reduce()`
- **leaderboard.test.ts** - Tests sorting algorithms, `Map`, `Set`
- **analytics.test.ts** - Tests `Math.max()`, `Math.min()`, averaging

**Why low value?**
- Test third-party library code (bcrypt, Node.js crypto)
- Test JavaScript language features that are already well-tested
- Don't test YOUR business logic
- Don't catch bugs in YOUR code

## Real Integration Tests (High Value) ✅

### attemptService.test.ts (COMPLETE - 23 tests)

Tests the **critical scoring algorithm** that determines user quiz scores:

✓ **Single Choice Scoring**
- Correct answer = 1 point
- Incorrect/no answer = 0 points
- Multiple selections (invalid) = 0 points

✓ **Multiple Choice Partial Scoring**
- Formula: `Math.max(0, (correct - incorrect) / totalCorrect)`
- All correct = 1.0
- Half correct = 0.5
- Wrong answers penalize score
- Score never goes negative

✓ **Total Quiz Score**
- Aggregates all question scores
- Converts to percentage (0-100)
- Rounds to 2 decimal places

✓ **Business Rules**
- Passing threshold validation
- Time tracking
- Answer correctness tracking
- Edge cases (empty quiz, floating point precision)

**Why high value?**
- Tests YOUR actual business logic
- Tests complex scoring algorithm that can have bugs
- Tests edge cases specific to your application
- Would catch calculation errors before production

### authService.test.ts (IN PROGRESS)

Will test actual authentication service functions once database mocking is complete.

## What Still Needs Testing

### High Priority (Critical Business Logic)

1. **attemptService.ts** - Full integration with mocked DB
   - `startAttempt()` - Resume vs new attempt logic
   - `submitQuiz()` - Full scoring with actual DB operations
   - `saveProgress()` - Partial save handling

2. **quizService.ts**
   - `listQuizzes()` - Filter SQL query generation
   - `getQuizForTaking()` - Hiding correct answers, question ordering
   - Search and filter combinations

3. **leaderboardService.ts**
   - `getQuizLeaderboard()` - Ranking by score then time
   - `getGlobalLeaderboard()` - Aggregation across quizzes
   - Tie-breaking logic

4. **analyticsService.ts**
   - `getQuizAnalytics()` - Pass rate, completion rate calculations
   - Score distribution buckets
   - Question performance analysis

### Medium Priority

5. **sessionService.ts**
   - Session validation and expiry
   - Resume in-progress attempt

6. **categoryService.ts**
   - Category listing with quiz counts

### Low Priority

7. **adminService.ts** - CRUD operations (standard DB ops)

## Next Steps

1. ✅ Move placeholder tests to separate folder
2. ✅ Create database mock utilities
3. ✅ Write attemptService scoring tests
4. 🔄 Complete authService integration tests
5. ⏳ Write quizService tests
6. ⏳ Write leaderboard tests
7. ⏳ Write analytics tests

## Running Tests

```bash
# Run only real integration tests
pnpm test src/__tests__/*.test.ts

# Run only placeholder tests
pnpm test src/__tests__/placeholder

# Run specific test file
pnpm test src/__tests__/attemptService.test.ts

# Run with coverage
pnpm test:coverage
```

## Database Mocking Strategy

Using `helpers/db-mock.ts` which provides:
- In-memory data storage
- Mock Drizzle ORM API (`query`, `insert`, `update`, `delete`)
- Test data reset between tests
- Vitest spies for verification

Example:
```typescript
const mockDb = createMockDb();
vi.spyOn(mockDb.query.users, 'findFirst').mockResolvedValue(mockUser);
```

## Key Differences

| Placeholder Tests | Real Integration Tests |
|-------------------|------------------------|
| Test JS built-ins | Test YOUR code |
| No DB interaction | Mock DB operations |
| No business logic | Test business rules |
| Low bug detection | High bug detection |
| Quick to write | Require setup |
| 108 tests | 23 tests (so far) |

**Bottom line:** The 23 real tests in `attemptService.test.ts` provide **more value** than all 108 placeholder tests combined because they test YOUR actual scoring algorithm.
