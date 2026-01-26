import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { QuizSummary, AttemptSummary } from 'shared';
import { quizApi, sessionApi, attemptApi } from '@/lib/api';
import { useQuiz } from '@/hooks/useQuiz';
import { useSession } from '@/hooks/useSession';
import { useAuthStore } from '@/store/authStore';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, BookOpen, PlayCircle, Clock, X, Trophy, Target, TrendingUp, LogIn } from 'lucide-react';

interface UserStats {
  totalCompleted: number;
  averageScore: number;
  bestScore: number;
}

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [inProgressAttempt, setInProgressAttempt] = useState<AttemptSummary | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedResume, setDismissedResume] = useState(false);
  const { startQuiz, isLoading: isStarting } = useQuiz();
  const { isInitialized, sessionToken } = useSession();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reset user-specific state
        setInProgressAttempt(null);
        setUserStats(null);
        
        // Fetch quizzes (public)
        const quizzesResponse = await quizApi.list();
        setQuizzes(quizzesResponse.quizzes);

        // Only fetch user-specific data for authenticated users
        if (isAuthenticated && sessionToken) {
          const [sessionResponse, historyResponse] = await Promise.all([
            sessionApi.validate(sessionToken),
            attemptApi.getHistory(sessionToken),
          ]);
          
          // Only set in-progress attempt if one exists
          if (sessionResponse.valid && sessionResponse.inProgressAttempt) {
            setInProgressAttempt(sessionResponse.inProgressAttempt);
          }

          // Calculate user stats from history
          const completedAttempts = historyResponse.attempts.filter(
            (a) => a.status === 'completed' && a.score !== null
          );
          
          if (completedAttempts.length > 0) {
            const scores = completedAttempts.map((a) => a.score!);
            setUserStats({
              totalCompleted: completedAttempts.length,
              averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
              bestScore: Math.max(...scores),
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized) {
      fetchData();
    }
  }, [isInitialized, sessionToken, isAuthenticated]);

  if (isLoading || !isInitialized) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const progressPercent = inProgressAttempt
    ? Math.round(((inProgressAttempt.totalQuestions - 1) / inProgressAttempt.totalQuestions) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Resume Quiz Banner - only for authenticated users with actual in-progress quiz */}
      {isAuthenticated && inProgressAttempt && inProgressAttempt.id && !dismissedResume && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Continue Your Quiz</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDismissedResume(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              You have an unfinished quiz. Pick up where you left off!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{inProgressAttempt.quizTitle}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Started {new Date(inProgressAttempt.startedAt).toLocaleDateString()}
                </span>
                <span>{inProgressAttempt.totalQuestions} questions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
            <Button asChild className="w-full">
              <Link to={`/quiz/${inProgressAttempt.quizId}`}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Stats - only for authenticated users */}
      {isAuthenticated && userStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                  <p className="text-2xl font-bold">{userStats.totalCompleted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{userStats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-2xl font-bold">{userStats.bestScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Welcome Banner for non-authenticated users */}
      {!isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold">Welcome to MCQ Quiz!</h2>
              <p className="text-sm text-muted-foreground">
                Login or create an account to start taking quizzes and track your progress.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0]}!` : 'Available Quizzes'}
        </h1>
        <p className="text-muted-foreground">
          {isAuthenticated 
            ? 'Choose a quiz to test your knowledge. Your progress will be saved automatically.'
            : 'Browse available quizzes below. Login to start taking quizzes and track your progress.'}
        </p>
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No quizzes available</h2>
          <p className="text-muted-foreground mt-2">
            Check back later for new quizzes.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStart={startQuiz}
              isLoading={isStarting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
