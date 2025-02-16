import { useSession } from "next-auth/react";

const DebugPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading session...</p>;
  if (!session) return <p>No session found. Try logging in.</p>;

  return (
    <div>
      <h1>Debug Info</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
};

export default DebugPage;
