import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  answered: number;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  answered,
  className,
}: ProgressBarProps) {
  const progressPercent = (answered / total) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Question {current} of {total}
        </span>
        <span>{answered} answered</span>
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  );
}
