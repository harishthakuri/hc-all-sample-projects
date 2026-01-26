import { eq, asc, sql } from 'drizzle-orm';
import { db, categories, quizzes } from '../db';
import type { Category, CreateCategoryRequest } from 'shared';

/**
 * Get all categories
 */
export async function listCategories(): Promise<Category[]> {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
      color: categories.color,
      order: categories.order,
      isActive: categories.isActive,
      quizCount: sql<number>`count(${quizzes.id})::int`,
    })
    .from(categories)
    .leftJoin(quizzes, eq(quizzes.categoryId, categories.id))
    .where(eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.order));

  return result;
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  return result || null;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });

  return result || null;
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const [category] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: data.order || 0,
    })
    .returning();

  return category;
}

/**
 * Update a category
 */
export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryRequest>
): Promise<Category> {
  const [category] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  return category;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
