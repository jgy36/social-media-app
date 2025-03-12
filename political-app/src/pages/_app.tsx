import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "@/redux/store";
import "@/styles/globals.css";
import { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Simple auth checker component
function AuthPersistence({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple function to check if user is logged in based on token existence
    const checkAuth = () => {
      try {
        console.log("Checking auth status for path:", router.pathname);

        const token = localStorage.getItem("token");

        // Skip auth check for public routes
        const publicRoutes = [
          "/login",
          "/register",
          "/",
          "/community",
          "/map",
          "/politicians",
        ];
        const isPublicRoute = publicRoutes.includes(router.pathname);

        console.log(
          "Is public route:",
          isPublicRoute,
          "Token exists:",
          !!token
        );

        if (isPublicRoute) {
          // If on a public route, no need to check auth
          setIsLoading(false);
          return;
        }

        // If no token and trying to access protected route, redirect to login
        if (!token) {
          console.log("No token found, redirecting to login");
          router.push("/login");
          return;
        }

        console.log("Token exists, allowing access to protected route");
        // Token exists, allow access to protected route
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoading(false);
      }
    };

    // Call checkAuth immediately
    checkAuth();

    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Force-ending loading state after timeout");
      setIsLoading(false);
    }, 3000); // 3 seconds max

    return () => clearTimeout(timeoutId);
  }, [router, router.pathname]); // Include both router and router.pathname

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Provider store={store}>
        <AuthPersistence>
          <Component {...pageProps} />
        </AuthPersistence>
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;
