// src/components/auth/LoginForm.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { loginUser, setAuthState } from "@/redux/slices/userSlice";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useApi";
import { verify2FA } from "@/api/auth"; // Add this import

const LoginForm = () => {
  // Add state for 2FA handling
  const [isTwoFARequired, setIsTwoFARequired] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false); // For 2FA verification loading state

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Use our custom hook
  const { loading, error: apiError, execute: login } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      // Use our API hook to login
      const result = await login({ email, password });

      // Check if 2FA is required - use optional chaining
      if (result?.requires2FA) {
        // Store the temporary token and show 2FA input
        setTempToken(result.tempToken || "");
        setIsTwoFARequired(true);
        return; // Stop here - we'll handle the 2FA verification separately
      }

      if (result && result.token) {
        // Dispatch to Redux to update global state
        dispatch(
          loginUser({
            email,
            password,
          })
        ).unwrap();

        console.log("Login successful, redirecting to feed");
        router.push("/feed");
      } else {
        setLocalError("Login failed - no token received");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Type assertion for error object
      const error = err as {
        response?: { data?: { errorCode?: string; message?: string } };
      };

      // Check for email verification error
      if (error.response?.data?.errorCode === "EMAIL_NOT_VERIFIED") {
        setLocalError("Please verify your email before logging in.");
      } else if (error.response?.data?.message) {
        // Use the error message from the server if available
        setLocalError(error.response.data.message);
      } else {
        setLocalError(
          typeof err === "string" ? err : "Login failed. Please try again."
        );
      }
    }
  };

  // Display either local error or API error
  const errorMessage = localError || (apiError ? apiError.message : null);

  // Add a handler for 2FA verification submission
  const handleTwoFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!twoFACode || twoFACode.length < 6) {
      setLocalError("Please enter a valid verification code");
      return;
    }

    try {
      setIsVerifying(true); // Start loading state
      // Call the verify2FA function from your auth API
      const result = await verify2FA(tempToken, twoFACode);
      setIsVerifying(false); // End loading state

      if (result && result.token) {
        // Use setAuthState instead of loginUser
        dispatch(
          setAuthState({
            token: result.token,
            user: result.user,
          })
        );
        console.log("2FA verification successful, redirecting to feed");
        router.push("/feed");
      } else {
        setLocalError("Verification failed - no token received");
      }
    } catch (err) {
      setIsVerifying(false);
      console.error("2FA verification error:", err);
      setLocalError(
        typeof err === "string" ? err : "Verification failed. Please try again."
      );
    }
  };

  // Render 2FA form if required
  if (isTwoFARequired) {
    return (
      <form onSubmit={handleTwoFASubmit} className="space-y-4">
        {localError && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
            {localError}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="twoFACode" className="block text-sm font-medium">
            Two-Factor Authentication Code
          </label>
          <input
            id="twoFACode"
            type="text"
            value={twoFACode}
            onChange={(e) => setTwoFACode(e.target.value)}
            placeholder="Enter your 6-digit code"
            className="w-full px-3 py-2 border rounded-md"
            required
            maxLength={6}
            pattern="\d{6}"
            disabled={isVerifying}
          />
          <p className="text-xs text-gray-500">
            Please enter the 6-digit code from your authenticator app
          </p>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>

        <div className="text-center text-sm mt-4">
          <button
            type="button"
            onClick={() => setIsTwoFARequired(false)}
            className="text-blue-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </button>

      <div className="text-center text-sm mt-4">
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-blue-600 hover:underline"
          disabled={loading}
        >
          Don&apos;t have an account? Register here
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
