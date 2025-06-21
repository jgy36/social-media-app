import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/api/apiClient";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

const VerifyPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await apiClient.get<VerifyEmailResponse>(`/auth/verify?token=${token}`);
      
      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setStatus("error");
      setMessage("An error occurred while verifying your email. Please try again.");
    }
  }, [router]);

  useEffect(() => {
    const { token } = router.query;
    
    if (token && typeof token === "string") {
      verifyEmail(token);
    }
  }, [router.query, verifyEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Registration
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;