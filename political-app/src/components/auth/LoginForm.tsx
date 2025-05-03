// src/components/auth/LoginForm.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { loginUser } from "@/redux/slices/userSlice";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useApi";

const LoginForm = () => {
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

      if (result && result.token) {
        // Dispatch to Redux to update global state
        dispatch(
          loginUser({
            email,
            password, // You may want to avoid passing password here
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
      const error = err as { response?: { data?: { errorCode?: string, message?: string } } };
      
      // Check for email verification error
      if (error.response?.data?.errorCode === "EMAIL_NOT_VERIFIED") {
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
