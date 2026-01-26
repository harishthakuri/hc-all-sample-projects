import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, users, sessions } from '../db';
import type { UserProfile, AuthResponse } from 'shared';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY_DAYS = 30;

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'user',
    })
    .returning();

  // Create session
  const sessionToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(sessions).values({
    sessionToken,
    userId: user.id,
    expiresAt,
  });

  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
    avatarUrl: user.avatarUrl,
  };

  return {
    user: userProfile,
    token: sessionToken,
    expiresAt,
  };
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  // Create session
  const sessionToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(sessions).values({
    sessionToken,
    userId: user.id,
    expiresAt,
  });

  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
    avatarUrl: user.avatarUrl,
  };

  return {
    user: userProfile,
    token: sessionToken,
    expiresAt,
  };
}

/**
 * Get user from session token
 */
export async function getUserFromToken(token: string): Promise<UserProfile | null> {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.sessionToken, token),
    with: { user: true },
  });

  if (!session || !session.user || session.expiresAt < new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as 'user' | 'admin',
    avatarUrl: session.user.avatarUrl,
  };
}

/**
 * Logout user (invalidate session)
 */
export async function logoutUser(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, token));
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatarUrl?: string }
): Promise<UserProfile> {
  const [user] = await db
    .update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'user' | 'admin',
    avatarUrl: user.avatarUrl,
  };
}

/**
 * Change password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Create admin user (for seeding)
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string
): Promise<void> {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  if (existingUser) {
    return; // Admin already exists
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: 'admin',
  });
}
