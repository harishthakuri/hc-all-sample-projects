import { Hono } from 'hono';
import { getQuizAnalytics, getDashboardStats } from '../services/analyticsService';
import { getUserFromToken } from '../services/authService';

const analytics = new Hono();

/**
 * GET /api/analytics/dashboard
 * Get dashboard stats (admin only)
 */
analytics.get('/dashboard', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }

    const stats = await getDashboardStats();
    return c.json({ success: true, data: stats });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get dashboard stats' }, 500);
  }
});

/**
 * GET /api/analytics/quiz/:quizId
 * Get analytics for a specific quiz (admin only)
 */
analytics.get('/quiz/:quizId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Admin access required' }, 403);
    }

    const quizId = c.req.param('quizId');
    const analyticsData = await getQuizAnalytics(quizId);
    return c.json({ success: true, data: analyticsData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get analytics';
    return c.json({ success: false, error: message }, 500);
  }
});

export default analytics;
