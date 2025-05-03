import { useRouter } from "next/router";
import { Mail } from "lucide-react";

const VerifyEmailPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg text-center">
        <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a verification link to your email address. Please check your
          inbox and click the link to verify your account.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;