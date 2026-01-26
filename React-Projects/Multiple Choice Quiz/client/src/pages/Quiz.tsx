import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flag, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { useTimer } from '@/hooks/useTimer';
import { QuestionDisplay } from '@/components/quiz/QuestionDisplay';
import { Timer } from '@/components/quiz/Timer';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuestionNav } from '@/components/quiz/QuestionNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function QuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const hasStartedRef = useRef(false);
  
  const {
    currentQuiz,
    currentQuestion,
    currentQuestionIndex,
    answers,
    progress,
    isLoading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleFlag,
    saveProgress,
    submitQuiz,
    isQuestionAnswered,
  } = useQuiz();

  // Timer hook
  const { timeRemaining, isTimeUp, start } = useTimer({
    initialTime: currentQuiz?.timeLimit || 420,
    onTimeUp: () => {
      submitQuiz();
    },
    autoStart: false,
  });

  // Load quiz if navigating directly to this page
  useEffect(() => {
    // Reset ref when quizId changes
    hasStartedRef.current = false;
  }, [quizId]);

  useEffect(() => {
    // If we have a quizId from URL but no quiz loaded, start/resume the quiz
    if (quizId && !currentQuiz && !isLoading && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startQuiz(quizId);
    }
  }, [quizId, currentQuiz, isLoading, startQuiz]);

  // Start timer when quiz loads
  useEffect(() => {
    if (currentQuiz) {
      start();
    }
  }, [currentQuiz, start]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!currentQuiz) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentQuiz, saveProgress]);

  // Redirect if no quiz is loaded and not loading (error case)
  useEffect(() => {
    // Only redirect if we've tried to start and failed
    if (!currentQuiz && !isLoading && hasStartedRef.current) {
      // Give it a moment before redirecting
      const timeout = setTimeout(() => {
        if (!currentQuiz) {
          navigate('/');
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentQuiz, isLoading, navigate]);

  // Calculate answered and flagged sets for navigation
  const { answeredSet, flaggedSet } = useMemo(() => {
    const answered = new Set<number>();
    const flagged = new Set<number>();

    currentQuiz?.questions.forEach((q, index) => {
      if (isQuestionAnswered(q.id)) {
        answered.add(index);
      }
      if (answers[q.id]?.isFlagged) {
        flagged.add(index);
      }
    });

    return { answeredSet: answered, flaggedSet: flagged };
  }, [currentQuiz, answers, isQuestionAnswered]);

  if (!currentQuiz || !currentQuestion) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const selectedOptionIds = answers[currentQuestion.id]?.optionIds || [];
  const isFlagged = answers[currentQuestion.id]?.isFlagged || false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar - Timer and Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow w-full sm:w-auto">
          <ProgressBar
            current={progress?.current || 1}
            total={progress?.total || 1}
            answered={progress?.answered || 0}
          />
        </div>
        <Timer timeRemaining={timeRemaining} />
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="pt-6">
          <QuestionDisplay
            question={currentQuestion}
            selectedOptionIds={selectedOptionIds}
            onSelect={(ids) => answerQuestion(currentQuestion.id, ids)}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentQuiz.questions.length}
            isFlagged={isFlagged}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={nextQuestion}
            disabled={currentQuestionIndex === currentQuiz.questions.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toggleFlag(currentQuestion.id)}
            className={cn(isFlagged && 'bg-yellow-100 border-yellow-300')}
          >
            <Flag className={cn('h-4 w-4 mr-1', isFlagged && 'fill-yellow-500')} />
            {isFlagged ? 'Unflag' : 'Flag'}
          </Button>

          {/* Submit Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">
                <Send className="h-4 w-4 mr-1" />
                Submit Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Quiz?</DialogTitle>
                <DialogDescription className="space-y-2">
                  <p>Are you sure you want to submit your quiz?</p>
                  <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                    <p>
                      <strong>Answered:</strong> {progress?.answered} of{' '}
                      {progress?.total} questions
                    </p>
                    <p>
                      <strong>Flagged:</strong> {progress?.flagged} questions
                    </p>
                    <p>
                      <strong>Unanswered:</strong>{' '}
                      {(progress?.total || 0) - (progress?.answered || 0)} questions
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Continue Quiz
                </Button>
                <Button onClick={submitQuiz} disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardContent className="pt-6">
          <QuestionNav
            totalQuestions={currentQuiz.questions.length}
            currentIndex={currentQuestionIndex}
            answeredQuestions={answeredSet}
            flaggedQuestions={flaggedSet}
            onNavigate={goToQuestion}
          />
        </CardContent>
      </Card>
    </div>
  );
}
