import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useRegister } from "@/hooks/useApi";
import { validateUsername } from "@/utils/usernameUtils";
import { loginUser } from "@/redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { checkUsernameAvailability } from "@/api/auth";
import debounce from 'lodash/debounce';

const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { toast } = useToast();
  const { loading, error: apiError, execute: register } = useRegister();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Field validation states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  
  // Username availability check state
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Use a ref for the debounced function to avoid dependency issues
  const debouncedCheckRef = useRef<any>(null);
  
  // Initialize the debounced function once on component mount
  useEffect(() => {
    debouncedCheckRef.current = debounce(async (username: string) => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      
      // First validate the format
      const formatValidation = validateUsername(username);
      if (!formatValidation.valid) {
        setUsernameError(formatValidation.message || "Invalid username format");
        setUsernameAvailable(null);
        return;
      }
      
      setCheckingUsername(true);
      
      try {
        const result = await checkUsernameAvailability(username);
        setUsernameAvailable(result.available);
        
        if (!result.available && result.message) {
          setUsernameError(result.message);
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
    
    // Cleanup on unmount
    return () => {
      if (debouncedCheckRef.current?.cancel) {
        debouncedCheckRef.current.cancel();
      }
    };
  }, []);

  // Check username when it changes
  useEffect(() => {
    // Only check usernames that are at least 3 characters
    if (username.trim().length >= 3) {
      if (debouncedCheckRef.current) {
        debouncedCheckRef.current(username);
      }
    } else {
      setUsernameAvailable(null);
      if (username.trim().length > 0) {
        setUsernameError("Username must be at least 3 characters");
      } else {
        setUsernameError(null);
      }
    }
  }, [username]);

  // Validate email when it changes
  useEffect(() => {
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailError(emailRegex.test(email) ? null : "Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Validate password when it changes
  useEffect(() => {
    if (password) {
      setPasswordError(password.length >= 8 ? null : "Password must be at least 8 characters long");
    } else {
      setPasswordError(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Reset errors
  setDisplayNameError(null);
  
  // Validate all fields
  let hasError = false;
  
  if (!displayName.trim()) {
    setDisplayNameError("Please enter your name");
    hasError = true;
  }
  
  // Username validation - use cached result if available
  if (usernameError || usernameAvailable === false) {
    hasError = true;
  } else if (username.trim().length < 3) {
    setUsernameError("Username must be at least 3 characters");
    hasError = true;
  }
  
  // Email validation
  if (email.trim() === "") {
    setEmailError("Email is required");
    hasError = true;
  } else if (emailError) {
    hasError = true;
  }
  
  // Password validation
  if (password.length < 8) {
    setPasswordError("Password must be at least 8 characters long");
    hasError = true;
  }
  
  if (hasError) {
    toast({
      variant: "destructive",
      title: "Please correct the errors",
      description: "Fix the highlighted fields before registering",
    });
    return;
  }
  
  // If username is still being checked, wait
  if (checkingUsername) {
    toast({
      variant: "default",
      title: "Please wait",
      description: "Verifying username availability...",
    });
    return;
  }

  try {
    // Attempt registration
    const result = await register({ username, email, password, displayName });

    if (result && result.success) {
      // Show success message but don't log in
      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      // Redirect to a verification pending page
      setTimeout(() => {
        router.push("/verify-email");
      }, 2000);
    } else {
      // Handle API response errors
      const errorMessage = result?.message || "Registration failed. Please try again.";
      
      if (errorMessage.includes("Username already exists")) {
        setUsernameError("Username already exists. Please choose another.");
        setUsernameAvailable(false);
        document.getElementById("username")?.focus();
      } else if (errorMessage.includes("Email already exists")) {
        setEmailError("Email already exists. Please use another email or login.");
        document.getElementById("email")?.focus();
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
        });
      }
    }
  } catch (err) {
    console.error("Registration error:", err);
    
    // Handle client-side and other errors
    const errorMessage = typeof err === "string" 
      ? err 
      : (err as Error).message || "Registration failed. Please try again.";
    
    if (errorMessage.includes("Username already exists")) {
      setUsernameError("Username already exists. Please choose another.");
      setUsernameAvailable(false);
      document.getElementById("username")?.focus();
    } else if (errorMessage.includes("Email already exists")) {
      setEmailError("Email already exists. Please use another email or login.");
      document.getElementById("email")?.focus();
    } else {
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: errorMessage,
      });
    }
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display Name Field */}
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
          className={`w-full px-3 py-2 border rounded-md ${
            displayNameError ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"
          }`}
          required
          disabled={loading}
        />
        {displayNameError && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> {displayNameError}
          </p>
        )}
      </div>

      {/* Username Field with real-time validation */}
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium">
          Username
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a unique username"
            className={`w-full px-3 py-2 border rounded-md ${
              usernameError ? "border-red-500 focus:ring-red-500" : 
              usernameAvailable === true ? "border-green-500 focus:ring-green-500" : 
              "focus:border-blue-500 focus:ring-blue-500"
            }`}
            required
            disabled={loading}
          />
          {checkingUsername && (
            <div className="absolute right-3 top-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}
          {!checkingUsername && usernameAvailable === true && username.length >= 3 && (
            <div className="absolute right-3 top-2 text-green-500">
              <Check className="h-5 w-5" />
            </div>
          )}
        </div>
        {usernameError ? (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> {usernameError}
          </p>
        ) : !usernameError && usernameAvailable === true && username.length >= 3 ? (
          <p className="text-sm text-green-500 flex items-center">
            <Check className="h-4 w-4 mr-1" /> Username is available
          </p>
        ) : null}
      </div>

      {/* Email Field */}
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
          className={`w-full px-3 py-2 border rounded-md ${
            emailError ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"
          }`}
          required
          disabled={loading}
        />
        {emailError && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> {emailError}
          </p>
        )}
      </div>

      {/* Password Field */}
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
          className={`w-full px-3 py-2 border rounded-md ${
            passwordError ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500"
          }`}
          required
          minLength={8}
          disabled={loading}
        />
        {passwordError && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" /> {passwordError}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={loading || checkingUsername || usernameAvailable === false || 
                !!usernameError || !!emailError || !!passwordError}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Registering...
          </>
        ) : checkingUsername ? (
          <>
            <Loader2 className="animate-spin mr-2 h-5 w-5" />
            Checking username...
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