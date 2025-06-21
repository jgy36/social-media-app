// src/pages/profile.tsx
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import UserCommunities from "@/components/profile/UserCommunities";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

const Profile = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Card className="shadow-md p-6 rounded-xl">
            <ProfileHeader />
          </Card>

          <UserCommunities />

          <ProfilePosts />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Profile;