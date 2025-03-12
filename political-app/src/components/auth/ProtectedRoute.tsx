// Enhanced: political-app/src/components/auth/ProtectedRoute.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only redirect after authentication state is determined (not loading)
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('⚠️ ProtectedRoute: User not authenticated, redirecting to login');
        router.push('/login');
      } else {
        console.log('✅ ProtectedRoute: User authenticated, allowing access');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Add simple error boundary
  useEffect(() => {
    const handleError = () => {
      console.error('❌ ProtectedRoute: Error detected');
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show loading state while determining authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md text-center">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">There was an error loading this page.</p>
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => router.push('/')}
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;