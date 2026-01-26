import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Clock, Users } from 'lucide-react';
import type { GlobalLeaderboard } from 'shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/leaderboard/global?limit=20`);
        const data = await response.json();
        if (data.success) {
          setLeaderboard(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700';
      case 3:
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top performers across all quizzes
          </p>
        </div>
      </div>

      {leaderboard && leaderboard.entries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Global Rankings
            </CardTitle>
            <CardDescription>
              {leaderboard.totalEntries} participants total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.entries.map((entry) => (
                <div
                  key={`${entry.userId || entry.rank}`}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50',
                    getRankBg(entry.rank)
                  )}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.avatarUrl ? (
                        <img
                          src={entry.avatarUrl}
                          alt={entry.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {entry.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium truncate">{entry.userName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="secondary">
                      {entry.totalQuizzes} quizzes
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {entry.averageScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        avg score
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No rankings yet</h2>
            <p className="text-muted-foreground mt-2">
              Complete quizzes to appear on the leaderboard!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
