import { Hono } from 'hono';
import { listQuizzes, getQuizForTaking, getFeaturedQuizzes, searchQuizzes } from '../services/quizService';
import type { QuizFilters } from 'shared';

const quizzesRoute = new Hono();

/**
 * GET /api/quizzes
 * List all active quizzes with optional filters
 */
quizzesRoute.get('/', async (c) => {
  try {
    const filters: QuizFilters = {
      categoryId: c.req.query('categoryId'),
      difficulty: c.req.query('difficulty') as any,
      search: c.req.query('search'),
      isFeatured: c.req.query('featured') === 'true' ? true : undefined,
      sortBy: c.req.query('sortBy') as any,
    };

    const quizzes = await listQuizzes(filters);
    return c.json({
      success: true,
      data: { quizzes },
    });
  } catch (error) {
    console.error('List quizzes error:', error);
    return c.json({
      success: false,
      error: 'Failed to list quizzes',
    }, 500);
  }
});

/**
 * GET /api/quizzes/featured
 * Get featured quizzes
 */
quizzesRoute.get('/featured', async (c) => {
  try {
    const quizzes = await getFeaturedQuizzes();
    return c.json({
      success: true,
      data: { quizzes },
    });
  } catch (error) {
    console.error('Get featured quizzes error:', error);
    return c.json({
      success: false,
      error: 'Failed to get featured quizzes',
    }, 500);
  }
});

/**
 * GET /api/quizzes/search
 * Search quizzes
 */
quizzesRoute.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const quizzes = await searchQuizzes(query);
    return c.json({
      success: true,
      data: { quizzes },
    });
  } catch (error) {
    console.error('Search quizzes error:', error);
    return c.json({
      success: false,
      error: 'Failed to search quizzes',
    }, 500);
  }
});

/**
 * GET /api/quizzes/:id
 * Get quiz details with questions
 */
quizzesRoute.get('/:id', async (c) => {
  try {
    const quizId = c.req.param('id');
    const quiz = await getQuizForTaking(quizId);

    if (!quiz) {
      return c.json({
        success: false,
        error: 'Quiz not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: { quiz },
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return c.json({
      success: false,
      error: 'Failed to get quiz',
    }, 500);
  }
});

export default quizzesRoute;
