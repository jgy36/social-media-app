// src/pages/_app.tsx
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "@/redux/store";
import "@/styles/globals.css";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { restoreAuthState, updateUserProfile } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { ThemeProvider } from "@/context/ThemeContext"; // Import the ThemeProvider

// Improved auth checker component
function AuthPersistence({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [authAttempted, setAuthAttempted] = useState(false);
  const token = useSelector((state: RootState) => state.user.token);
  
  // Add an event listener for profile updates from the API
  useEffect(() => {
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

  // This will catch the custom event dispatched from refreshUserProfile in api.ts 
  // and ensure the Redux store state is updated to match

  useEffect(() => {
    // Skip auth check for public routes immediately
    const publicRoutes = ["/login", "/register", "/", "/community", "/map", "/politicians"];
    const isPublicRoute = publicRoutes.includes(router.pathname);
    
    if (isPublicRoute) {
      console.log("Public route detected, skipping auth check:", router.pathname);
      setIsLoading(false);
      return;
    }

    // Function to check if user is logged in based on token existence
    const checkAuth = async () => {
      try {
        console.log("Checking auth status for path:", router.pathname);
        
        // Only attempt to restore auth once
        if (!authAttempted) {
          const result = await dispatch(restoreAuthState()).unwrap();
          setAuthAttempted(true);
          
          // If we didn't get a token but are on a protected route, redirect to login
          if (!result.token && !isPublicRoute) {
            console.log("No token found, redirecting to login");
            router.push("/login");
            return;
          }
          
          console.log("Auth check complete, allowing access");
          setIsLoading(false);
        } else {
          // Already attempted auth once, don't keep loading
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoading(false);
        
        // On error, redirect to login for protected routes
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
    };

    // Call checkAuth immediately 
    checkAuth();

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Force-ending loading state after timeout");
      setIsLoading(false);
      
      // If still loading after timeout and on protected route, redirect to login
      if (!authAttempted && !isPublicRoute) {
        router.push("/login");
      }
    }, 3000); // 3 seconds max

    return () => clearTimeout(timeoutId);
  }, [router, router.pathname, dispatch, authAttempted, token]);

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

  return <>{children}</>;
}

// Redux-connected AuthPersistence wrapper
function ConnectedAuthPersistence({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthPersistence>{children}</AuthPersistence>
    </Provider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <ConnectedAuthPersistence>
        {/* Wrap everything in the ThemeProvider */}
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </ConnectedAuthPersistence>
    </SessionProvider>
  );
}

export default MyApp;