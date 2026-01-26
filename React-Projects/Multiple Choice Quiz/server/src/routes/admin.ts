import { Hono, Context, Next } from 'hono';
import type { UserProfile } from 'shared';
import {
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizForAdmin,
    listQuizzesForAdmin,
    toggleQuizActive,
    toggleQuizFeatured,
    listUsers,
    updateUserRole,
    toggleUserActive,
} from '../services/adminService';
import { getUserFromToken } from '../services/authService';

// Define context variables type
type Variables = {
    user: UserProfile;
};

const admin = new Hono<{ Variables: Variables }>();

// Middleware to check admin access
const requireAdmin = async (c: Context<{ Variables: Variables }>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return c.json({ success: false, error: 'Not authenticated' }, 401);
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'admin') {
        return c.json({ success: false, error: 'Admin access required' }, 403);
    }

    c.set('user', user);
    await next();
};

admin.use('/*', requireAdmin);

// ============================================
// Quiz Management
// ============================================

/**
 * GET /api/admin/quizzes
 * List all quizzes with filters
 */
admin.get('/quizzes', async (c) => {
    try {
        const filters = {
            categoryId: c.req.query('categoryId'),
            difficulty: c.req.query('difficulty') as any,
            search: c.req.query('search'),
            isFeatured: c.req.query('isFeatured') === 'true' ? true : undefined,
            sortBy: c.req.query('sortBy') as any,
            page: Number(c.req.query('page')) || 1,
            pageSize: Number(c.req.query('pageSize')) || 20,
        };

        const result = await listQuizzesForAdmin(filters);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to list quizzes' }, 500);
    }
});

/**
 * GET /api/admin/quizzes/:id
 * Get quiz details for editing
 */
admin.get('/quizzes/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const quiz = await getQuizForAdmin(id);

        if (!quiz) {
            return c.json({ success: false, error: 'Quiz not found' }, 404);
        }

        return c.json({ success: true, data: { quiz } });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to get quiz' }, 500);
    }
});

/**
 * POST /api/admin/quizzes
 * Create a new quiz
 */
admin.post('/quizzes', async (c) => {
    try {
        const user = c.get('user');
        const data = await c.req.json();
        const quiz = await createQuiz(data, user.id);
        return c.json({ success: true, data: { quiz } }, 201);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create quiz';
        return c.json({ success: false, error: message }, 500);
    }
});

/**
 * PUT /api/admin/quizzes/:id
 * Update a quiz
 */
admin.put('/quizzes/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await c.req.json();
        const quiz = await updateQuiz({ ...data, id });
        return c.json({ success: true, data: { quiz } });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update quiz';
        return c.json({ success: false, error: message }, 500);
    }
});

/**
 * DELETE /api/admin/quizzes/:id
 * Delete a quiz
 */
admin.delete('/quizzes/:id', async (c) => {
    try {
        const id = c.req.param('id');
        await deleteQuiz(id);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to delete quiz' }, 500);
    }
});

/**
 * POST /api/admin/quizzes/:id/toggle-active
 * Toggle quiz active status
 */
admin.post('/quizzes/:id/toggle-active', async (c) => {
    try {
        const id = c.req.param('id');
        const quiz = await toggleQuizActive(id);
        return c.json({ success: true, data: { quiz } });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to toggle quiz status' }, 500);
    }
});

/**
 * POST /api/admin/quizzes/:id/toggle-featured
 * Toggle quiz featured status
 */
admin.post('/quizzes/:id/toggle-featured', async (c) => {
    try {
        const id = c.req.param('id');
        const quiz = await toggleQuizFeatured(id);
        return c.json({ success: true, data: { quiz } });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to toggle featured status' }, 500);
    }
});

// ============================================
// User Management
// ============================================

/**
 * GET /api/admin/users
 * List all users
 */
admin.get('/users', async (c) => {
    try {
        const page = Number(c.req.query('page')) || 1;
        const pageSize = Number(c.req.query('pageSize')) || 20;
        const result = await listUsers(page, pageSize);
        return c.json({ success: true, data: result });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to list users' }, 500);
    }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
admin.patch('/users/:id/role', async (c) => {
    try {
        const id = c.req.param('id');
        const { role } = await c.req.json();
        await updateUserRole(id, role);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to update user role' }, 500);
    }
});

/**
 * POST /api/admin/users/:id/toggle-active
 * Toggle user active status
 */
admin.post('/users/:id/toggle-active', async (c) => {
    try {
        const id = c.req.param('id');
        await toggleUserActive(id);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to toggle user status' }, 500);
    }
});

export default admin;
