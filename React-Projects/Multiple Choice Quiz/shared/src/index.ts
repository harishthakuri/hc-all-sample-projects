/**
 * Shared Types for Multiple Choice Quiz Application
 * 
 * This module contains all shared TypeScript types and interfaces
 * used across both client and server packages.
 */

// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'user' | 'admin';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

/**
 * User without sensitive data (for client)
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}

/**
 * Auth request types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  expiresAt: Date;
}

// ============================================
// Category Types
// ============================================

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  quizCount?: number;
}

// ============================================
// Entity Types
// ============================================

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Quiz entity representing a complete quiz
 */
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  difficulty: QuizDifficulty;
  timeLimit: number; // in seconds, default 420 (7 minutes)
  passingScore: number;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Question type - single choice or multiple choice (select all that apply)
 */
export type QuestionType = 'single' | 'multiple';

/**
 * Question entity
 */
export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  explanation: string | null;
  order: number;
  createdAt: Date;
}

/**
 * Answer option for a question
 */
export interface Option {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
}

/**
 * User session for anonymous tracking
 */
export interface Session {
  id: string;
  sessionToken: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

/**
 * Quiz attempt status
 */
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Quiz attempt tracking user's progress
 */
export interface QuizAttempt {
  id: string;
  sessionId: string;
  quizId: string;
  status: AttemptStatus;
  score: number | null;
  startedAt: Date;
  completedAt: Date | null;
  currentQuestion: number;
}

/**
 * Individual answer in an attempt
 */
export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  optionId: string | null;
  isCorrect: boolean | null;
  isFlagged: boolean;
  answeredAt: Date | null;
}

// ============================================
// API Request/Response Types
// ============================================

/**
 * Quiz with question count for listing
 */
export interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  difficulty: QuizDifficulty;
  questionCount: number;
  timeLimit: number;
  estimatedMinutes: number;
  isFeatured: boolean;
}

/**
 * Question with options for quiz taking (without correct answers)
 */
export interface QuestionWithOptions {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  options: OptionForQuiz[];
}

/**
 * Option without isCorrect flag for quiz taking
 */
export interface OptionForQuiz {
  id: string;
  text: string;
  order: number;
}

/**
 * Full quiz data for taking a quiz
 */
export interface QuizWithQuestions {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number;
  questions: QuestionWithOptions[];
}

/**
 * Answer submission from client
 */
export interface AnswerSubmission {
  questionId: string;
  optionIds: string[]; // Array to support multi-select
  isFlagged: boolean;
}

/**
 * Progress update request
 */
export interface ProgressUpdate {
  currentQuestion: number;
  answers: AnswerSubmission[];
}

/**
 * Result for a single question after submission
 */
export interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  options: OptionWithCorrect[];
  isCorrect: boolean;
  score: number; // For partial scoring
  explanation: string | null;
}

/**
 * Option with correct flag for results
 */
export interface OptionWithCorrect {
  id: string;
  text: string;
  isCorrect: boolean;
  wasSelected: boolean;
}

/**
 * Complete quiz results
 */
export interface QuizResults {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  partialAnswers: number;
  completedAt: Date;
  timeTaken: number; // in seconds
  questions: QuestionResult[];
}

/**
 * Attempt summary for history
 */
export interface AttemptSummary {
  id: string;
  quizId: string;
  quizTitle: string;
  status: AttemptStatus;
  score: number | null;
  totalQuestions: number;
  startedAt: Date;
  completedAt: Date | null;
}

// ============================================
// API Response Wrappers
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Session API Types
// ============================================

export interface CreateSessionResponse {
  sessionToken: string;
  expiresAt: Date;
}

export interface ValidateSessionResponse {
  valid: boolean;
  session?: Session;
  inProgressAttempt?: AttemptSummary;
}

// ============================================
// Quiz API Types
// ============================================

export interface ListQuizzesResponse {
  quizzes: QuizSummary[];
}

export interface GetQuizResponse {
  quiz: QuizWithQuestions;
}

// ============================================
// Attempt API Types
// ============================================

export interface StartAttemptRequest {
  sessionToken: string;
  quizId: string;
}

export interface StartAttemptResponse {
  attemptId: string;
  quiz: QuizWithQuestions;
}

export interface SaveProgressRequest {
  currentQuestion: number;
  answers: AnswerSubmission[];
}

export interface SaveProgressResponse {
  success: boolean;
  savedAt: Date;
}

export interface SubmitQuizResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
}

export interface GetResultsResponse {
  results: QuizResults;
}

export interface GetHistoryResponse {
  attempts: AttemptSummary[];
}

// ============================================
// Utility Types
// ============================================

/**
 * Fisher-Yates shuffle utility type marker
 */
export type Shuffled<T> = T[];

/**
 * Partial scoring calculation result
 */
export interface PartialScoreResult {
  score: number; // 0 to 1
  correctSelections: number;
  incorrectSelections: number;
  totalCorrectOptions: number;
}

// ============================================
// Leaderboard Types
// ============================================

export interface LeaderboardEntry {
  rank: number;
  sessionId: string;
  userId: string | null;
  userName: string;
  avatarUrl: string | null;
  score: number;
  timeTaken: number;
  completedAt: Date;
}

export interface QuizLeaderboard {
  quizId: string;
  quizTitle: string;
  entries: LeaderboardEntry[];
  totalEntries: number;
}

export interface GlobalLeaderboard {
  entries: GlobalLeaderboardEntry[];
  totalEntries: number;
}

export interface GlobalLeaderboardEntry {
  rank: number;
  userId: string | null;
  userName: string;
  avatarUrl: string | null;
  totalQuizzes: number;
  averageScore: number;
  totalScore: number;
}

// ============================================
// Analytics Types
// ============================================

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  averageTimeTaken: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  scoreDistribution: ScoreDistribution[];
  questionAnalytics: QuestionAnalytics[];
}

export interface ScoreDistribution {
  range: string; // e.g., "0-20", "21-40", etc.
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctRate: number;
  averageTimeSpent: number;
  mostSelectedOption: string;
}

export interface DashboardStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalUsers: number;
  totalAttempts: number;
  activeQuizzes: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  type: 'quiz_completed' | 'user_registered' | 'quiz_created';
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

// ============================================
// Admin Types
// ============================================

export interface CreateQuizRequest {
  title: string;
  description?: string;
  categoryId?: string;
  difficulty: QuizDifficulty;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  isFeatured: boolean;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  explanation?: string;
  order: number;
  options: CreateOptionRequest[];
}

export interface CreateOptionRequest {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {
  id: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
}

// ============================================
// Search & Filter Types
// ============================================

export interface QuizFilters {
  categoryId?: string;
  difficulty?: QuizDifficulty;
  search?: string;
  isFeatured?: boolean;
  sortBy?: 'newest' | 'popular' | 'title';
}

export interface QuizSearchResult extends QuizSummary {
  categoryName: string | null;
  categorySlug: string | null;
  difficulty: QuizDifficulty;
}

// ============================================
// Social Sharing Types
// ============================================

export interface ShareData {
  title: string;
  text: string;
  url: string;
  score?: number;
  quizTitle?: string;
}

export interface ShareResult {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'copy' | 'native';
  success: boolean;
}
