import { Clock, AlertTriangle } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';

interface TimerProps {
  timeRemaining: number;
  className?: string;
}

export function Timer({ timeRemaining, className }: TimerProps) {
  const isLow = timeRemaining <= 60; // Less than 1 minute
  const isCritical = timeRemaining <= 30; // Less than 30 seconds

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg font-semibold transition-colors',
        isCritical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isLow
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-muted text-foreground',
        className
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
}
