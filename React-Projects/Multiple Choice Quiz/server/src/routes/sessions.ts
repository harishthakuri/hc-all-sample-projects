import { Hono } from 'hono';
import { createSession, validateSession } from '../services/sessionService';

const sessions = new Hono();

/**
 * POST /api/sessions
 * Create a new anonymous session
 */
sessions.post('/', async (c) => {
  try {
    const session = await createSession();
    return c.json({
      success: true,
      data: session,
    }, 201);
  } catch (error) {
    console.error('Create session error:', error);
    return c.json({
      success: false,
      error: 'Failed to create session',
    }, 500);
  }
});

/**
 * GET /api/sessions/:token
 * Validate and refresh an existing session
 */
sessions.get('/:token', async (c) => {
  try {
    const token = c.req.param('token');
    const result = await validateSession(token);
    
    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Validate session error:', error);
    return c.json({
      success: false,
      error: 'Failed to validate session',
    }, 500);
  }
});

export default sessions;
