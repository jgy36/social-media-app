// src/components/auth/ProtectedRoute.tsx - Fixed to use isAuthenticated flag

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { restoreAuthState } from '@/redux/slices/userSlice';
import { checkAuthStatus } from '@/api/auth';
import { isAuthenticated as checkIsAuthenticated } from '@/utils/tokenUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Use the isAuthenticated flag instead of token
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Function to verify auth state
    const verifyAuth = async () => {
      try {
        // First check if we already have auth in Redux
        if (isAuthenticated) {
          console.log('✅ ProtectedRoute: User authenticated via Redux state, allowing access');
          setIsLoading(false);
          return;
        }
        
        // If not authenticated in Redux, check localStorage
        if (checkIsAuthenticated()) {
          console.log('✅ ProtectedRoute: User authenticated via localStorage, restoring state');
          // Restore auth state in Redux
          await dispatch(restoreAuthState()).unwrap();
          setIsLoading(false);
          return;
        }
        
        // If not authenticated in Redux or localStorage, check with server
        console.log('🔍 ProtectedRoute: Not authenticated in local state, checking with server...');
        const authWithServer = await checkAuthStatus();
        
        if (authWithServer) {
          console.log('✅ ProtectedRoute: User authenticated via server check, restoring state');
          // Restore auth state in Redux
          await dispatch(restoreAuthState()).unwrap();
          setIsLoading(false);
          return;
        }
        
        // No auth in Redux, localStorage, or from server, redirect to login
        if (!redirectInProgress) {
          console.log('⚠️ ProtectedRoute: User not authenticated, redirecting to login');
          setRedirectInProgress(true);
          
          // Store the current path to redirect back after login
          const currentPath = router.asPath;
          if (currentPath !== '/login') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          router.push('/login');
        }
      } catch (error) {
        console.error('❌ ProtectedRoute: Error during authentication check:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Check auth status
    verifyAuth();
    
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
  }, [isAuthenticated, router, dispatch, redirectInProgress]);

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
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;