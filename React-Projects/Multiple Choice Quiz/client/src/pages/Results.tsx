import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Home,
  RotateCcw,
  Clock,
} from 'lucide-react';
import type { QuizResults } from 'shared';
import { attemptApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShareResults } from '@/components/ShareResults';
import { ExportPDF } from '@/components/ExportPDF';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { cn, formatTime, getScoreColor, getScoreBgColor } from '@/lib/utils';

/**
 * Check if text contains markdown syntax
 */
function hasMarkdown(text: string): boolean {
  return /```|`[^`]+`|\*\*|__|\[.*\]\(.*\)|^#+\s|^-\s|^\d+\.\s/m.test(text);
}

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) return;

      try {
        const response = await attemptApi.getResults(attemptId);
        setResults(response.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !results) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'Results not found'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Score Card */}
      <Card className={cn('border-2', getScoreBgColor(results.score))}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">{results.quizTitle}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div
            className={cn(
              'text-6xl font-bold',
              getScoreColor(results.score)
            )}
          >
            {results.score.toFixed(1)}%
          </div>
          <Progress
            value={results.score}
            className="h-3 max-w-md mx-auto"
            indicatorClassName={cn(
              results.score >= 80
                ? 'bg-green-500'
                : results.score >= 60
                ? 'bg-yellow-500'
                : results.score >= 40
                ? 'bg-orange-500'
                : 'bg-red-500'
            )}
          />
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>{results.correctAnswers} correct</span>
            </div>
            {results.partialAnswers > 0 && (
              <div className="flex items-center gap-1">
                <MinusCircle className="h-4 w-4 text-yellow-600" />
                <span>{results.partialAnswers} partial</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>
                {results.totalQuestions -
                  results.correctAnswers -
                  results.partialAnswers}{' '}
                incorrect
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatTime(results.timeTaken)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
        </Button>
        <Button asChild>
          <Link to={`/quiz/${results.quizId}`}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Link>
        </Button>
        <ShareResults
          score={results.score}
          quizTitle={results.quizTitle}
          attemptId={results.attemptId}
        />
        <ExportPDF results={results} />
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Question Breakdown</h2>
        {results.questions.map((question, index) => (
          <Card
            key={question.questionId}
            className={cn(
              'border-l-4',
              question.isCorrect
                ? 'border-l-green-500'
                : question.score > 0
                ? 'border-l-yellow-500'
                : 'border-l-red-500'
            )}
          >
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Question {index + 1}
                    </span>
                    {question.questionType === 'multiple' && (
                      <Badge variant="secondary" className="text-xs">
                        Multi-select
                      </Badge>
                    )}
                    {question.isCorrect ? (
                      <Badge variant="success">Correct</Badge>
                    ) : question.score > 0 ? (
                      <Badge variant="warning">Partial</Badge>
                    ) : (
                      <Badge variant="destructive">Incorrect</Badge>
                    )}
                  </div>
                  {hasMarkdown(question.questionText) ? (
                    <div className="font-medium">
                      <MarkdownRenderer content={question.questionText} />
                    </div>
                  ) : (
                    <p className="font-medium">{question.questionText}</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-start gap-2 p-2 rounded text-sm',
                      option.isCorrect && 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800',
                      option.wasSelected &&
                        !option.isCorrect &&
                        'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800',
                      !option.isCorrect &&
                        !option.wasSelected &&
                        'bg-muted/30'
                    )}
                  >
                    {option.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : option.wasSelected ? (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div
                      className={cn(
                        'flex-grow',
                        option.wasSelected && 'font-medium',
                        option.isCorrect && 'text-green-700 dark:text-green-400',
                        option.wasSelected && !option.isCorrect && 'text-red-700 dark:text-red-400'
                      )}
                    >
                      {hasMarkdown(option.text) ? (
                        <MarkdownRenderer content={option.text} />
                      ) : (
                        option.text
                      )}
                    </div>
                    {option.wasSelected && (
                      <Badge variant="outline" className="ml-auto text-xs flex-shrink-0">
                        Your answer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-3 text-sm">
                  <strong className="text-blue-700 dark:text-blue-400">Explanation:</strong>{' '}
                  {hasMarkdown(question.explanation) ? (
                    <div className="text-blue-800 dark:text-blue-300 mt-1">
                      <MarkdownRenderer content={question.explanation} />
                    </div>
                  ) : (
                    <span className="text-blue-800 dark:text-blue-300">{question.explanation}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
