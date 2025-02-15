import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/slices/userSlice";
import { useRouter } from "next/router";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);

  const handleLogout = () => {
    dispatch(logoutUser()); // ✅ Dispatch logout
    router.push("/login"); // ✅ Redirect to login page
  };

  return (
    <nav className="w-full p-4 bg-[var(--navbar-color)] flex justify-between items-center">
      {/* ✅ Branding - Home link */}
      <Link href="/" className="text-xl font-bold">
        PoliticalApp
      </Link>

      {/* ✅ Navigation Links */}
      <div className="flex gap-4">
        <Link href="/feed">Feed</Link>
        <Link href="/community">Community</Link>
        <Link href="/map">Map</Link>
        <Link href="/politicians">Politicians</Link>
        <Link href="/profile">Profile</Link>

        {/* ✅ Conditional Auth Buttons */}
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
