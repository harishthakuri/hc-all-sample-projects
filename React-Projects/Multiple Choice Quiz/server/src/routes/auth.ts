import { Hono } from 'hono';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserFromToken,
  updateUserProfile,
  changePassword,
} from '../services/authService';

const auth = new Hono();

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({
        success: false,
        error: 'Email, password, and name are required',
      }, 400);
    }

    if (password.length < 6) {
      return c.json({
        success: false,
        error: 'Password must be at least 6 characters',
      }, 400);
    }

    const result = await registerUser(email, password, name);
    return c.json({ success: true, data: result }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return c.json({ success: false, error: message }, 400);
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({
        success: false,
        error: 'Email and password are required',
      }, 400);
    }

    const result = await loginUser(email, password);
    return c.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return c.json({ success: false, error: message }, 401);
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
auth.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await logoutUser(token);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    return c.json({ success: true, data: { user } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get user' }, 500);
  }
});

/**
 * PATCH /api/auth/profile
 * Update user profile
 */
auth.patch('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    const updates = await c.req.json();
    const updatedUser = await updateUserProfile(user.id, updates);

    return c.json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update profile' }, 500);
  }
});

/**
 * POST /api/auth/change-password
 * Change password
 */
auth.post('/change-password', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();
    await changePassword(user.id, currentPassword, newPassword);

    return c.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return c.json({ success: false, error: message }, 400);
  }
});

export default auth;
