import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileQuestion, Eye, EyeOff, Star, StarOff } from 'lucide-react';
import type { QuizSummary } from 'shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface QuizWithStatus extends QuizSummary {
  isActive?: boolean;
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<QuizWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { token } = useAuthStore();

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/quizzes?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data.quizzes);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      toast({ title: 'Error', description: 'Failed to load quizzes', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuizzes();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setQuizzes((prev) => prev.filter((q) => q.id !== id));
        toast({ title: 'Success', description: 'Quiz deleted successfully' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete quiz', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/quizzes/${id}/toggle-active`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isActive: data.data.quiz.isActive } : q))
        );
        toast({ title: 'Success', description: 'Quiz status updated' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quiz', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/quizzes/${id}/toggle-featured`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isFeatured: data.data.quiz.isFeatured } : q))
        );
        toast({ title: 'Success', description: 'Featured status updated' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quiz', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Manage all quizzes</p>
        </div>
        <Button asChild>
          <Link to="/admin/quizzes/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Quizzes Table */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No quizzes yet</h2>
            <p className="text-muted-foreground mt-2">
              Create your first quiz to get started.
            </p>
            <Button className="mt-4" asChild>
              <Link to="/admin/quizzes/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{quiz.title}</span>
                      {quiz.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {quiz.categoryName || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{quiz.questionCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quiz.difficulty === 'easy'
                          ? 'success'
                          : quiz.difficulty === 'hard'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="capitalize"
                    >
                      {quiz.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.isActive !== false ? 'default' : 'secondary'}>
                      {quiz.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(quiz.id)}
                        title={quiz.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {quiz.isFeatured ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(quiz.id)}
                        title={quiz.isActive !== false ? 'Deactivate' : 'Activate'}
                      >
                        {quiz.isActive !== false ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/quizzes/${quiz.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{quiz.title}" and all its questions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(quiz.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
