import Navbar from "@/components/navbar/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileSettings from "@/components/profile/ProfileSettings";

const Profile = () => {
  return (
    <div>
      <Navbar />
      <ProfileHeader />
      <ProfilePosts />
      <ProfileSettings />
    </div>
  );
};

export default Profile;
