import type { QuestionWithOptions } from 'shared';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: QuestionWithOptions;
  selectedOptionIds: string[];
  onSelect: (optionIds: string[]) => void;
  questionNumber: number;
  totalQuestions: number;
  isFlagged?: boolean;
}

/**
 * Check if text contains markdown syntax (code blocks, formatting, etc.)
 */
function hasMarkdown(text: string): boolean {
  return /```|`[^`]+`|\*\*|__|\[.*\]\(.*\)|^#+\s|^-\s|^\d+\.\s/m.test(text);
}

export function QuestionDisplay({
  question,
  selectedOptionIds,
  onSelect,
  questionNumber,
  totalQuestions,
  isFlagged,
}: QuestionDisplayProps) {
  const isMultiple = question.type === 'multiple';
  const questionHasMarkdown = hasMarkdown(question.text);

  const handleSingleSelect = (optionId: string) => {
    onSelect([optionId]);
  };

  const handleMultipleSelect = (optionId: string, checked: boolean) => {
    if (checked) {
      onSelect([...selectedOptionIds, optionId]);
    } else {
      onSelect(selectedOptionIds.filter((id) => id !== optionId));
    }
  };

  // Render option text - use markdown if it contains code/formatting
  const renderOptionText = (text: string) => {
    if (hasMarkdown(text)) {
      return <MarkdownRenderer content={text} className="text-base" />;
    }
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            {isMultiple && (
              <Badge variant="secondary" className="text-xs">
                Select all that apply
              </Badge>
            )}
            {isFlagged && (
              <Badge variant="warning" className="text-xs">
                Flagged
              </Badge>
            )}
          </div>
          {/* Question Text - render as markdown if it contains code blocks */}
          {questionHasMarkdown ? (
            <div className="text-xl font-semibold">
              <MarkdownRenderer content={question.text} />
            </div>
          ) : (
            <h2 className="text-xl font-semibold">{question.text}</h2>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {isMultiple ? (
          // Multi-select with checkboxes
          question.options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            const optionHasMarkdown = hasMarkdown(option.text);
            return (
              <div
                key={option.id}
                className={cn(
                  'flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => handleMultipleSelect(option.id, !isSelected)}
              >
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  className="mt-1"
                  onCheckedChange={(checked) =>
                    handleMultipleSelect(option.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={option.id}
                  className="flex-grow cursor-pointer text-base"
                >
                  {optionHasMarkdown ? (
                    <MarkdownRenderer content={option.text} />
                  ) : (
                    option.text
                  )}
                </Label>
              </div>
            );
          })
        ) : (
          // Single-select with radio buttons
          <RadioGroup
            value={selectedOptionIds[0] || ''}
            onValueChange={handleSingleSelect}
          >
            {question.options.map((option) => {
              const isSelected = selectedOptionIds.includes(option.id);
              const optionHasMarkdown = hasMarkdown(option.text);
              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => handleSingleSelect(option.id)}
                >
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <Label
                    htmlFor={option.id}
                    className="flex-grow cursor-pointer text-base"
                  >
                    {optionHasMarkdown ? (
                      <MarkdownRenderer content={option.text} />
                    ) : (
                      option.text
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}
      </div>
    </div>
  );
}
