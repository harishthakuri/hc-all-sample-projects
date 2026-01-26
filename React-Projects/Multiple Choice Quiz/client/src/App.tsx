import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSessionInit } from '@/hooks/useSession';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import HomePage from '@/pages/Home';
import QuizPage from '@/pages/Quiz';
import ResultsPage from '@/pages/Results';
import HistoryPage from '@/pages/History';
import LeaderboardPage from '@/pages/Leaderboard';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import CategoryList from '@/pages/admin/categories/CategoryList';
import CategoryForm from '@/pages/admin/categories/CategoryForm';
import QuizList from '@/pages/admin/quizzes/QuizList';
import QuizForm from '@/pages/admin/quizzes/QuizForm';
import QuestionManager from '@/pages/admin/quizzes/QuestionManager';
import UserList from '@/pages/admin/users/UserList';

function App() {
  // Initialize session on app load
  useSessionInit();

  return (
    <ThemeProvider defaultTheme="system" storageKey="mcq-ui-theme">
      <Routes>
        {/* Public Layout */}
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected routes - require login */}
          <Route
            path="quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="results/:attemptId"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Layout - requires admin role */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          
          {/* Categories */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          
          {/* Quizzes */}
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quizzes/new" element={<QuizForm />} />
          <Route path="quizzes/:id/edit" element={<QuizForm />} />
          <Route path="quizzes/:id/questions" element={<QuestionManager />} />
          
          {/* Users */}
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
