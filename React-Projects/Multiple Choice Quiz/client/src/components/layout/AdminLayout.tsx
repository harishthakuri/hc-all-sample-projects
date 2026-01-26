import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileQuestion,
  FolderTree,
  Users,
  ChevronLeft,
  Menu,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/quizzes', label: 'Quizzes', icon: FileQuestion },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Admin Dashboard</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-card border-r transition-all duration-300 flex flex-col',
            sidebarOpen ? 'w-64' : 'w-16'
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="font-semibold text-lg">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {sidebarItems.map(({ path, label, icon: Icon, exact }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive(path, exact)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            ))}
          </nav>

          {/* Back to App */}
          <div className="p-2 border-t">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-muted-foreground'
              )}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>Back to App</span>}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
