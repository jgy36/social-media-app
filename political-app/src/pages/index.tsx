import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "@/redux/store";

const HomePage = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/feed"); // ✅ Redirects to feed if logged in
    } else {
      router.push("/login"); // ✅ Redirects to login if NOT logged in
    }
  }, [token, router]);

  return null; // ✅ No UI needed, just redirection logic
};

export default HomePage;
