import { Hono } from 'hono';
import {
  getQuizLeaderboard,
  getGlobalLeaderboard,
  getUserQuizRank,
} from '../services/leaderboardService';

const leaderboard = new Hono();

/**
 * GET /api/leaderboard/global
 * Get global leaderboard
 */
leaderboard.get('/global', async (c) => {
  try {
    const limit = Number(c.req.query('limit')) || 10;
    const result = await getGlobalLeaderboard(limit);
    return c.json({ success: true, data: result });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get leaderboard' }, 500);
  }
});

/**
 * GET /api/leaderboard/quiz/:quizId
 * Get leaderboard for a specific quiz
 */
leaderboard.get('/quiz/:quizId', async (c) => {
  try {
    const quizId = c.req.param('quizId');
    const limit = Number(c.req.query('limit')) || 10;
    const result = await getQuizLeaderboard(quizId, limit);
    return c.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get leaderboard';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * GET /api/leaderboard/quiz/:quizId/rank/:sessionId
 * Get user's rank on a specific quiz
 */
leaderboard.get('/quiz/:quizId/rank/:sessionId', async (c) => {
  try {
    const quizId = c.req.param('quizId');
    const sessionId = c.req.param('sessionId');
    const rank = await getUserQuizRank(quizId, sessionId);
    return c.json({ success: true, data: { rank } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get rank' }, 500);
  }
});

export default leaderboard;
