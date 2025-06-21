import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
