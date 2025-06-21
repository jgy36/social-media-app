import { useSession, signIn } from "next-auth/react";

const ProtectedPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">You must be signed in</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => signIn()}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
    </div>
  );
};

export default ProtectedPage;
