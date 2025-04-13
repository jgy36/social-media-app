import { useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/useApi";
import { validateUsername } from "@/utils/usernameUtils";
import { loginUser } from "@/redux/slices/userSlice"; // Import the same action used by login
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>(); // Add this
  const router = useRouter();
  const { toast } = useToast();
  const { loading, error: apiError, execute: register } = useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // New state for display name
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: usernameValidation.message,
      });
      return;
    }

    // Validate display name
    if (!displayName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter your name",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    try {
      // Pass displayName to the registration function
      const result = await register({ username, email, password, displayName });

      if (result && result.success) {
        // The token might be nested in different ways depending on your API structure
        // Try one of these options:

        // Option 1: If token is part of the data property
        if (result.data && result.data.token) {
          await dispatch(loginUser({ email, password })).unwrap();
        }
        // Option 2: If you just want to dispatch login regardless
        else {
          // Just dispatch the login action with credentials
          await dispatch(loginUser({ email, password })).unwrap();
        }
        // Show success toast
        toast({
          title: "Registration Successful",
          description: "Redirecting to your feed...",
        });

        // Slight delay to show toast
        setTimeout(() => {
          router.push("/feed");
        }, 2000);
      } else {
        // Show error from backend
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result?.message || "Please try again.",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Show error toast
      toast({
        variant: "destructive",
        title: "Registration Error",
        description:
          typeof err === "string"
            ? err
            : (err as Error).message ||
              "Registration failed. Please try again.",
      });
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

      {/* Display Name Field - Added */}
      <div className="space-y-2">
        <label htmlFor="displayName" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

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
          placeholder="Password (min 8 characters)"
          className="w-full px-3 py-2 border rounded-md"
          required
          minLength={8}
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
            Registering...
          </>
        ) : (
          "Register"
        )}
      </button>

      <div className="text-center text-sm mt-4">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-blue-600 hover:underline"
          disabled={loading}
        >
          Already have an account? Login here
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;