import { Link } from 'react-router-dom';
import { Clock, FileQuestion, LogIn, Play } from 'lucide-react';
import type { QuizSummary } from 'shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

interface QuizCardProps {
  quiz: QuizSummary;
  onStart: (quizId: string) => void;
  isLoading?: boolean;
}

export function QuizCard({ quiz, onStart, isLoading }: QuizCardProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
          {quiz.isFeatured && (
            <Badge variant="default" className="shrink-0">Featured</Badge>
          )}
        </div>
        {quiz.description && (
          <CardDescription className="line-clamp-3">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileQuestion className="h-3 w-3" />
            {quiz.questionCount} questions
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {quiz.estimatedMinutes} min
          </Badge>
          {quiz.difficulty && (
            <Badge 
              variant={
                quiz.difficulty === 'easy' ? 'success' : 
                quiz.difficulty === 'hard' ? 'destructive' : 
                'warning'
              }
              className="capitalize"
            >
              {quiz.difficulty}
            </Badge>
          )}
          {quiz.categoryName && (
            <Badge variant="outline">{quiz.categoryName}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isAuthenticated ? (
          <Button
            className="w-full"
            onClick={() => onStart(quiz.id)}
            disabled={isLoading}
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Starting...' : 'Start Quiz'}
          </Button>
        ) : (
          <Button className="w-full" asChild>
            <Link to="/login" state={{ from: `/quiz/${quiz.id}` }}>
              <LogIn className="h-4 w-4 mr-2" />
              Login to Start
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
