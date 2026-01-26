import { Link, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginPromptProps {
  title?: string;
  description?: string;
}

export function LoginPrompt({ 
  title = "Login Required", 
  description = "Please login or create an account to continue"
}: LoginPromptProps) {
  const location = useLocation();

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/login" state={{ from: location.pathname }}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/register" state={{ from: location.pathname }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
