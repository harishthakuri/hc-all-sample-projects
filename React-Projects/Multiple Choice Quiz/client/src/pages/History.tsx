import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Eye, RotateCcw } from 'lucide-react';
import type { AttemptSummary } from 'shared';
import { attemptApi } from '@/lib/api';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn, formatDate, getScoreColor } from '@/lib/utils';
import { AlertCircle, History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  const { sessionToken, isInitialized } = useSession();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!sessionToken) return;

      try {
        const response = await attemptApi.getHistory(sessionToken);
        setAttempts(response.attempts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    if (isInitialized && sessionToken) {
      fetchHistory();
    }
  }, [sessionToken, isInitialized]);

  if (isLoading || !isInitialized) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
        <p className="text-muted-foreground">
          View your past quiz attempts and results.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No quiz history</h2>
          <p className="text-muted-foreground mt-2 mb-4">
            You haven't completed any quizzes yet.
          </p>
          <Button asChild>
            <Link to="/">Browse Quizzes</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {attempt.quizTitle}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(attempt.startedAt)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      attempt.status === 'completed'
                        ? 'success'
                        : attempt.status === 'in_progress'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {attempt.status === 'in_progress'
                      ? 'In Progress'
                      : attempt.status === 'completed'
                      ? 'Completed'
                      : 'Abandoned'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {attempt.status === 'completed' && attempt.score !== null && (
                      <div className="flex items-center gap-2">
                        <Trophy
                          className={cn('h-5 w-5', getScoreColor(attempt.score))}
                        />
                        <span
                          className={cn(
                            'text-xl font-bold',
                            getScoreColor(attempt.score)
                          )}
                        >
                          {attempt.score.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {attempt.totalQuestions} questions
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {attempt.status === 'completed' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/results/${attempt.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Results
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/quiz/${attempt.quizId}`}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {attempt.status === 'in_progress' ? 'Continue' : 'Retake'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
