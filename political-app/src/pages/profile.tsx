import Navbar from "@/components/navbar/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import { Card } from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <Card className="shadow-md p-6 rounded-xl">
          <ProfileHeader />
        </Card>
        <ProfilePosts />
      </div>
    </div>
  );
};

export default Profile;
