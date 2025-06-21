import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
