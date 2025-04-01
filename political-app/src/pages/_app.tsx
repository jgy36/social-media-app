/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/_app.tsx - Updated with Redux persist
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";
import { store, persistor } from "@/redux/store";
import "@/styles/globals.css";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuthState, updateUserProfile } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { ThemeProvider } from "@/context/ThemeContext";
import AppRouterHandler from "@/components/AppRouterHandler";
import { Toaster } from "@/components/ui/toaster";
import { SWRConfig } from 'swr';
import axios from 'axios';
import { checkAuthStatus } from "@/api/auth";

// Global fetcher function
const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Improved auth checker component
function AuthPersistence({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  
  // Move selectors outside useEffect
  const token = useSelector((state: RootState) => state.user.token);
  const isUserAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  
  useEffect(() => {
    // Add an event listener for profile updates from the API
    const handleProfileUpdate = (event: Event) => {
      // Check if we're authenticated and have dispatch function
      if (token && dispatch) {
        const customEvent = event as CustomEvent;
        console.log("Profile update event received:", customEvent.detail);
        
        // Dispatch the updateUserProfile thunk to update Redux state
        dispatch(updateUserProfile())
          .then(() => {
            console.log("User profile updated in Redux store");
          })
          .catch((error) => {
            console.error("Failed to update profile in Redux:", error);
          });
      }
    };

    // Listen for custom events from the API module
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    // Clean up the listener when component unmounts
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [token, dispatch]);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Skip auth check for public routes immediately
    const publicRoutes = ["/login", "/register", "/", "/community", "/map", "/politicians"];
    const isPublicRoute = publicRoutes.some(route => router.pathname.startsWith(route));
    
    if (isPublicRoute) {
      console.log("Public route detected, skipping auth check:", router.pathname);
      setIsLoading(false);
      return;
    }

    // Use the selector value from outside the effect
    if (isUserAuthenticated) {
      console.log("User already authenticated via Redux state, continuing");
      setIsLoading(false);
      return;
    }

    // Function to check if user is logged in with server
    const checkAuth = async () => {
      try {
        console.log("Checking auth status for path:", router.pathname);
        
        // Check auth status with server
        const isAuthenticated = await checkAuthStatus();
        
        if (!isAuthenticated && !isPublicRoute) {
          console.log("Not authenticated, redirecting to login");
          setRedirectInProgress(true);
          router.push("/login");
          return;
        }
        
        // If authenticated with server but not in Redux, restore state
        if (isAuthenticated) {
          console.log("Authenticated with server, restoring Redux state");
          await dispatch(restoreAuthState()).unwrap();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoading(false);
        
        // On error, redirect to login for protected routes
        if (!isPublicRoute) {
          setRedirectInProgress(true);
          router.push("/login");
        }
      }
    };

    // Call checkAuth immediately 
    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [router, router.pathname, dispatch, isUserAuthenticated]);

  // Show loading state with a cancel button
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>Verifying your session...</p>
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => {
            console.log("Manually cancelling loading state");
            setIsLoading(false);
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  // If we're redirecting, show a loading indicator
  if (redirectInProgress) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Redux-connected AuthPersistence wrapper
function ConnectedAuthPersistence({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthPersistence>{children}</AuthPersistence>
      </PersistGate>
    </Provider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ConnectedAuthPersistence>
        <ThemeProvider>
          <SWRConfig 
            value={{
              fetcher,
              revalidateOnFocus: false,
              dedupingInterval: 5000,
              errorRetryCount: 3,
            }}
          >
            {/* Include the AppRouterHandler to manage navigation behavior */}
            <AppRouterHandler />
            <Component {...pageProps} />
            <Toaster />
          </SWRConfig>
        </ThemeProvider>
      </ConnectedAuthPersistence>
    </SessionProvider>
  );
}

export default MyApp;