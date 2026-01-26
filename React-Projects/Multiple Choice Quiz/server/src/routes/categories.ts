import { Hono } from 'hono';
import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { getUserFromToken } from '../services/authService';

const categoriesRoute = new Hono();

/**
 * GET /api/categories
 * List all categories
 */
categoriesRoute.get('/', async (c) => {
  try {
    const categories = await listCategories();
    return c.json({ success: true, data: { categories } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to list categories' }, 500);
  }
});

/**
 * GET /api/categories/:idOrSlug
 * Get category by ID or slug
 */
categoriesRoute.get('/:idOrSlug', async (c) => {
  try {
    const idOrSlug = c.req.param('idOrSlug');
    
    // Try to get by ID first (UUID format), then by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    
    let category;
    if (isUUID) {
      const { getCategoryById } = await import('../services/categoryService');
      category = await getCategoryById(idOrSlug);
    } else {
      category = await getCategoryBySlug(idOrSlug);
    }

    if (!category) {
      return c.json({ success: false, error: 'Category not found' }, 404);
    }

    return c.json({ success: true, data: { category } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to get category' }, 500);
  }
});

/**
 * POST /api/categories
 * Create a new category (admin only)
 */
categoriesRoute.post('/', async (c) => {
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

    const data = await c.req.json();
    const category = await createCategory(data);

    return c.json({ success: true, data: { category } }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create category';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * PATCH /api/categories/:id
 * Update a category (admin only)
 */
categoriesRoute.patch('/:id', async (c) => {
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

    const id = c.req.param('id');
    const data = await c.req.json();
    const category = await updateCategory(id, data);

    return c.json({ success: true, data: { category } });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update category' }, 500);
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category (admin only)
 */
categoriesRoute.delete('/:id', async (c) => {
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

    const id = c.req.param('id');
    await deleteCategory(id);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete category' }, 500);
  }
});

export default categoriesRoute;
