import Navbar from "@/components/navbar/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileSettings from "@/components/profile/ProfileSettings";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/slices/userSlice";
import { useRouter } from "next/router";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login"); // ✅ Redirect after logout
  };

  return (
    <div>
      <Navbar /> {/* ✅ Navbar should be used properly */}
      <div className="p-4 max-w-2xl mx-auto">
        <ProfileHeader />
        <ProfilePosts />

        {/* ✅ Pass `handleLogout` to ProfileSettings */}
        <ProfileSettings onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Profile;
