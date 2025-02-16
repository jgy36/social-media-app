import { useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

const LandingPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      router.push("/feed"); // ✅ Redirect logged-in users to the feed page
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Join Today</h1>

      <div className="space-y-4 w-80">
        <button
          className="w-full flex items-center justify-center bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200"
          onClick={() => signIn("google")}
        >
          <Image
            src="/google-icon.svg"
            alt="Google"
            width={20}
            height={20}
            className="h-5 w-5 mr-2"
          />
          Sign Up with Google
        </button>

        <button
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => router.push("/register")}
        >
          Create Account
        </button>
      </div>

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
