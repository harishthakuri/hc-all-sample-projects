import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Save,
  Eye,
  Code,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Question {
  id?: string;
  text: string;
  type: 'single' | 'multiple';
  explanation: string;
  order: number;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

const emptyQuestion: Question = {
  text: '',
  type: 'single',
  explanation: '',
  order: 0,
  options: [
    { text: '', isCorrect: false, order: 1 },
    { text: '', isCorrect: false, order: 2 },
    { text: '', isCorrect: false, order: 3 },
    { text: '', isCorrect: false, order: 4 },
  ],
};

export default function QuestionManager() {
  const navigate = useNavigate();
  const { id: quizId } = useParams();
  const { token } = useAuthStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ ...emptyQuestion });

  // Fetch quiz with questions
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setQuiz(data.data.quiz);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load quiz', variant: 'destructive' });
        navigate('/admin/quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, token, navigate]);

  const openAddDialog = () => {
    setEditingQuestion(null);
    setCurrentQuestion({
      ...emptyQuestion,
      order: (quiz?.questions.length || 0) + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setCurrentQuestion({ ...question });
    setDialogOpen(true);
  };

  const handleSaveQuestion = async () => {
    // Validate
    if (!currentQuestion.text.trim()) {
      toast({ title: 'Error', description: 'Question text is required', variant: 'destructive' });
      return;
    }

    const filledOptions = currentQuestion.options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) {
      toast({ title: 'Error', description: 'At least 2 options are required', variant: 'destructive' });
      return;
    }

    const correctOptions = filledOptions.filter((o) => o.isCorrect);
    if (correctOptions.length === 0) {
      toast({ title: 'Error', description: 'At least one correct answer is required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare questions array for update
      const updatedQuestions = editingQuestion
        ? quiz!.questions.map((q) =>
            q.id === editingQuestion.id
              ? { ...currentQuestion, options: filledOptions }
              : q
          )
        : [...(quiz?.questions || []), { ...currentQuestion, options: filledOptions }];

      // Save to backend
      const response = await fetch(`${API_BASE}/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questions: updatedQuestions.map((q, index) => ({
            text: q.text,
            type: q.type,
            explanation: q.explanation,
            order: index + 1,
            options: q.options.map((o, oIndex) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: oIndex + 1,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh quiz data
        const refreshResponse = await fetch(`${API_BASE}/admin/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setQuiz(refreshData.data.quiz);
        }
        
        setDialogOpen(false);
        toast({
          title: 'Success',
          description: editingQuestion ? 'Question updated' : 'Question added',
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save question', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const updatedQuestions = quiz!.questions
        .filter((q) => q.id !== questionId)
        .map((q, index) => ({
          text: q.text,
          type: q.type,
          explanation: q.explanation,
          order: index + 1,
          options: q.options.map((o, oIndex) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oIndex + 1,
          })),
        }));

      const response = await fetch(`${API_BASE}/admin/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questions: updatedQuestions }),
      });

      const data = await response.json();

      if (data.success) {
        setQuiz((prev) =>
          prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== questionId) } : null
        );
        toast({ title: 'Success', description: 'Question deleted' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete question', variant: 'destructive' });
    }
  };

  const updateOption = (index: number, updates: Partial<Option>) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, ...updates } : o)),
    }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false, order: prev.options.length + 1 }],
    }));
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      toast({ title: 'Error', description: 'Minimum 2 options required', variant: 'destructive' });
      return;
    }
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/quizzes/${quizId}/edit`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Manage Questions</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      {quiz.questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No questions yet. Add your first question!</p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <Card key={question.id || index}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">
                        <MarkdownRenderer content={question.text} />
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={question.type === 'single' ? 'secondary' : 'outline'}>
                          {question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                        </Badge>
                        <span>{question.options.length} options</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(question)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this question and all its options.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteQuestion(question.id!)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`flex items-start gap-2 p-2 rounded-md ${
                        option.isCorrect ? 'bg-green-50 dark:bg-green-950/30' : 'bg-muted/50'
                      }`}
                    >
                      {option.isCorrect ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className={option.isCorrect ? 'text-green-700 dark:text-green-400' : ''}>
                        <MarkdownRenderer content={option.text} />
                      </div>
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                    <strong>Explanation:</strong>
                    <MarkdownRenderer content={question.explanation} className="mt-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update the question details' : 'Create a new question'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="questionText">Question Text *</Label>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Code className="h-3 w-3" />
                  <span>Supports Markdown & code blocks</span>
                </div>
              </div>
              <Textarea
                id="questionText"
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Enter your question...

For code blocks, use:
```javascript
const example = 'Hello';
```"
                rows={5}
                className="font-mono text-sm"
              />
              {/* Markdown Preview */}
              {currentQuestion.text && (
                <div className="border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </div>
                  <MarkdownRenderer content={currentQuestion.text} />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Use ` ```language ` for code blocks (javascript, python, csharp, java, etc.)
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: 'single' | 'multiple') =>
                    setCurrentQuestion({ ...currentQuestion, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multiple">Multiple Choice (Select All)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        updateOption(index, { isCorrect: checked as boolean })
                      }
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, { text: e.target.value })}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                      disabled={currentQuestion.options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Check the box next to correct answer(s)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (shown after answering)</Label>
              <Textarea
                id="explanation"
                value={currentQuestion.explanation}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })
                }
                placeholder="Explain why this answer is correct..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
