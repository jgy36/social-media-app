import { useRouter } from "next/router";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Join Today</h1>

      {/* Signup Buttons */}
      <div className="space-y-4 w-80">
        <button
          className="w-full flex items-center justify-center bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200"
          onClick={() => alert("Google Sign Up - Implement OAuth")}
        >
          <img src="/google-icon.svg" alt="Google" className="h-5 w-5 mr-2" />
          Sign Up with Google
        </button>

        <button
          className="w-full flex items-center justify-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900"
          onClick={() => alert("Apple Sign Up - Implement OAuth")}
        >
          <img src="/apple-icon.svg" alt="Apple" className="h-5 w-5 mr-2" />
          Sign Up with Apple
        </button>

        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => router.push("/register")}
        >
          Create Account
        </button>
      </div>

      {/* Sign In Button */}
      <button
        className="mt-6 w-80 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        onClick={() => router.push("/login")}
      >
        Sign In
      </button>
    </div>
  );
};

export default LandingPage;
