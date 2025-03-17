// Enhanced: political-app/src/components/auth/ProtectedRoute.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = useSelector((state: RootState) => state.user.token);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Check if token exists (we're authenticated)
    if (!token && !redirectInProgress) {
      console.log('⚠️ ProtectedRoute: User not authenticated, redirecting to login');
      setRedirectInProgress(true);
      router.push('/login');
    } else if (token) {
      console.log('✅ ProtectedRoute: User authenticated, allowing access');
      setIsLoading(false);
    }

    // Add simple error boundary
    const handleError = () => {
      console.error('❌ ProtectedRoute: Error detected');
      setHasError(true);
      setIsLoading(false);
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      clearTimeout(timeoutId);
    };
  }, [token, router, redirectInProgress]);

  // Show loading state while determining authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
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

  // If we're redirecting, show a loading indicator
  if (redirectInProgress) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // If authenticated, render children
  return token ? <>{children}</> : null;
};

export default ProtectedRoute;