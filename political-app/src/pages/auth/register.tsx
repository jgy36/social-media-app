import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", { username, email, password });
      router.push("/login"); // Redirect to login after registering
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="bg-white p-6 rounded shadow-md"
        onSubmit={handleRegister}
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-2 border"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2">
          Register
        </button>
      </form>
    </div>
  );
}
