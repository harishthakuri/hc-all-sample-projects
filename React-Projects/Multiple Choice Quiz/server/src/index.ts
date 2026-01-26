import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import dotenv from 'dotenv';

import sessionsRoute from './routes/sessions';
import quizzesRoute from './routes/quizzes';
import attemptsRoute from './routes/attempts';
import authRoute from './routes/auth';
import categoriesRoute from './routes/categories';
import leaderboardRoute from './routes/leaderboard';
import analyticsRoute from './routes/analytics';
import adminRoute from './routes/admin';

// Load environment variables
dotenv.config({ path: '../.env' });

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow localhost on any port for development
      if (!origin || origin.startsWith('http://localhost:')) {
        return origin || '*';
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.route('/api/sessions', sessionsRoute);
app.route('/api/quizzes', quizzesRoute);
app.route('/api/attempts', attemptsRoute);
app.route('/api/auth', authRoute);
app.route('/api/categories', categoriesRoute);
app.route('/api/leaderboard', leaderboardRoute);
app.route('/api/analytics', analyticsRoute);
app.route('/api/admin', adminRoute);

// History endpoint (mounted on sessions)
app.get('/api/sessions/:token/attempts', async (c) => {
  const token = c.req.param('token');
  const { getHistory } = await import('./services/attemptService');
  try {
    const attempts = await getHistory(token);
    return c.json({
      success: true,
      data: { attempts },
    });
  } catch (error) {
    console.error('Get history error:', error);
    return c.json({
      success: false,
      error: 'Failed to get history',
    }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      success: false,
      error: 'Internal server error',
    },
    500
  );
});

const port = Number(process.env.PORT) || 3001;

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Multiple Choice Quiz - API Server                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Starting server on port ${port}...                              ║
║                                                               ║
║  Features:                                                    ║
║  - Authentication (register, login)                           ║
║  - Categories & Search                                        ║
║  - Leaderboards                                               ║
║  - Analytics Dashboard                                        ║
║  - Admin Panel                                                ║
╚═══════════════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running at http://localhost:${port}`);
console.log(`Health check: http://localhost:${port}/health`);
