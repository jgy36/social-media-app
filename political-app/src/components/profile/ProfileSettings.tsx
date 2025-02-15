import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { logoutUser } from "@/redux/slices/userSlice";

const ProfileSettings: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser()); // ✅ Clears token and username
    router.push("/login"); // ✅ Redirect to login page
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Settings</h2>

      {/* ✅ Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileSettings;
