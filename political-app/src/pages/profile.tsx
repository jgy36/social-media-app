import Navbar from "@/components/navbar/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileSettings from "@/components/profile/ProfileSettings";
import SettingsDropdown from "@/components/profile/SettingsDropdown"; // ✅ Import new dropdown
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { logoutUser } from "@/redux/slices/userSlice";
import { useRouter } from "next/router";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <div>
      <Navbar /> {/* ✅ Navbar should be used properly */}
      <div className="relative p-4 max-w-2xl mx-auto">
        {/* 🔥 Add the Settings Button in the Top-Right */}
        <div className="absolute top-4 right-4">
          <SettingsDropdown />
        </div>

        <ProfileHeader />
        <ProfilePosts />

        <ProfileSettings onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Profile;
