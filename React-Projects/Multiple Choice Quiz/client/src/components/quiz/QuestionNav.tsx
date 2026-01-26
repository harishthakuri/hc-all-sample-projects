import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuestionNavProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (index: number) => void;
}

export function QuestionNav({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  flaggedQuestions,
  onNavigate,
}: QuestionNavProps) {
  const [isExpanded, setIsExpanded] = useState(totalQuestions <= 30);

  // Determine button size and grid columns based on question count
  const isCompact = totalQuestions > 20;
  const isVeryLarge = totalQuestions > 50;
  
  // Grid columns: more columns for compact mode
  const gridCols = isCompact
    ? 'grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15'
    : 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10';
  
  // Button size: smaller for more questions
  const buttonSize = isCompact ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  const renderQuestionButton = (index: number) => {
    const isAnswered = answeredQuestions.has(index);
    const isFlagged = flaggedQuestions.has(index);
    const isCurrent = index === currentIndex;

    return (
      <button
        key={index}
        className={cn(
          'rounded-md border font-medium transition-colors',
          buttonSize,
          isCurrent && 'ring-2 ring-primary ring-offset-1',
          isAnswered && !isCurrent && 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
          isFlagged && 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
          !isAnswered && !isFlagged && !isCurrent && 'bg-background hover:bg-muted border-input'
        )}
        onClick={() => onNavigate(index)}
      >
        {index + 1}
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header with summary */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          Question Navigator
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-green-600 dark:text-green-400 font-medium">
            {answeredQuestions.size}/{totalQuestions} answered
          </span>
          {flaggedQuestions.size > 0 && (
            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
              {flaggedQuestions.size} flagged
            </span>
          )}
        </div>
      </div>

      {/* Quick jump dropdown for very large quizzes */}
      {isVeryLarge && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Jump to:</span>
          <Select
            value={String(currentIndex)}
            onValueChange={(value) => onNavigate(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue>Question {currentIndex + 1}</SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {Array.from({ length: totalQuestions }, (_, i) => {
                const isAnswered = answeredQuestions.has(i);
                const isFlagged = flaggedQuestions.has(i);
                return (
                  <SelectItem key={i} value={String(i)}>
                    <span className="flex items-center gap-2">
                      Q{i + 1}
                      {isAnswered && <span className="h-2 w-2 rounded-full bg-green-500" />}
                      {isFlagged && <span className="h-2 w-2 rounded-full bg-yellow-500" />}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Hide grid' : 'Show grid'}
            <ChevronDown className={cn('h-3 w-3 ml-1 transition-transform', isExpanded && 'rotate-180')} />
          </Button>
        </div>
      )}

      {/* Question grid */}
      {(isExpanded || !isVeryLarge) && (
        <div
          className={cn(
            'overflow-y-auto',
            totalQuestions > 30 && 'max-h-32',
            totalQuestions > 50 && 'max-h-40'
          )}
        >
          <div className={cn('grid gap-1.5', gridCols)}>
            {Array.from({ length: totalQuestions }, (_, i) => renderQuestionButton(i))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1 border-t">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-700" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded ring-2 ring-primary ring-offset-1" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}
