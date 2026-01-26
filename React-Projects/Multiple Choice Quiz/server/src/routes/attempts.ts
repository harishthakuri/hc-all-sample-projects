import { Hono } from 'hono';
import {
  startAttempt,
  getAttempt,
  saveProgress,
  submitQuiz,
  getResults,
  getHistory,
} from '../services/attemptService';
import type { SaveProgressRequest } from 'shared';

const attempts = new Hono();

/**
 * POST /api/attempts
 * Start a new quiz attempt
 */
attempts.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { sessionToken, quizId } = body;

    if (!sessionToken || !quizId) {
      return c.json({
        success: false,
        error: 'Missing sessionToken or quizId',
      }, 400);
    }

    const result = await startAttempt(sessionToken, quizId);
    return c.json({
      success: true,
      data: result,
    }, 201);
  } catch (error) {
    console.error('Start attempt error:', error);
    const message = error instanceof Error ? error.message : 'Failed to start attempt';
    return c.json({
      success: false,
      error: message,
    }, 500);
  }
});

/**
 * GET /api/attempts/:id
 * Get attempt details for resuming
 */
attempts.get('/:id', async (c) => {
  try {
    const attemptId = c.req.param('id');
    const result = await getAttempt(attemptId);

    if (!result) {
      return c.json({
        success: false,
        error: 'Attempt not found',
      }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get attempt error:', error);
    return c.json({
      success: false,
      error: 'Failed to get attempt',
    }, 500);
  }
});

/**
 * PATCH /api/attempts/:id
 * Save quiz progress
 */
attempts.patch('/:id', async (c) => {
  try {
    const attemptId = c.req.param('id');
    const body = await c.req.json() as SaveProgressRequest;

    const result = await saveProgress(attemptId, body);
    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Save progress error:', error);
    return c.json({
      success: false,
      error: 'Failed to save progress',
    }, 500);
  }
});

/**
 * POST /api/attempts/:id/submit
 * Submit completed quiz
 */
attempts.post('/:id/submit', async (c) => {
  try {
    const attemptId = c.req.param('id');
    const result = await submitQuiz(attemptId);
    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit quiz';
    return c.json({
      success: false,
      error: message,
    }, 500);
  }
});

/**
 * GET /api/attempts/:id/results
 * Get detailed results for an attempt
 */
attempts.get('/:id/results', async (c) => {
  try {
    const attemptId = c.req.param('id');
    const results = await getResults(attemptId);
    return c.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error('Get results error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get results';
    return c.json({
      success: false,
      error: message,
    }, 500);
  }
});

/**
 * GET /api/sessions/:token/attempts
 * Get all attempts for a session (history)
 */
attempts.get('/session/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const attemptsList = await getHistory(token);
    return c.json({
      success: true,
      data: { attempts: attemptsList },
    });
  } catch (error) {
    console.error('Get history error:', error);
    return c.json({
      success: false,
      error: 'Failed to get history',
    }, 500);
  }
});

export default attempts;
