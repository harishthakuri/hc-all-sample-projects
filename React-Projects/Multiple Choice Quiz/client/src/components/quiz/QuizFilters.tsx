import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { Category, QuizDifficulty } from 'shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface QuizFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    categoryId?: string;
    difficulty?: QuizDifficulty;
  }) => void;
}

export function QuizFilters({ onFilterChange }: QuizFiltersProps) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [difficulty, setDifficulty] = useState<QuizDifficulty | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: search || undefined, categoryId, difficulty });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, categoryId, difficulty, onFilterChange]);

  const clearFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setDifficulty(undefined);
  };

  const hasFilters = search || categoryId || difficulty;

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {selectedCategory ? selectedCategory.name : 'Category'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCategoryId(undefined)}>
            All Categories
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
              {category.quizCount !== undefined && (
                <Badge variant="secondary" className="ml-auto">
                  {category.quizCount}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Difficulty Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 capitalize">
            {difficulty || 'Difficulty'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDifficulty(undefined)}>
            All Levels
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDifficulty('easy')}>
            <Badge variant="success" className="mr-2">Easy</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDifficulty('medium')}>
            <Badge variant="warning" className="mr-2">Medium</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDifficulty('hard')}>
            <Badge variant="destructive" className="mr-2">Hard</Badge>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
