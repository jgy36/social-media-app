// src/components/auth/RegisterForm.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { registerUser } from "@/redux/slices/userSlice";
import { useRouter } from "next/router";
import { useRegister } from "@/hooks/useApi"; // Use the API hook

const RegisterForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, execute: register } = useRegister(); // Use the hook

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      // Use the API hook to register
      const result = await register({ username, email, password });
      
      if (result && result.success) {
        router.push("/login"); // Redirect to login after registration
      } else {
        setLocalError(result?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setLocalError(
        typeof err === "string" ? err : "Registration failed. Please try again."
      );
    }
  };

  // Display either local error or API error
  const errorMessage = localError || (error ? (error.message || "Registration failed") : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

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
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;