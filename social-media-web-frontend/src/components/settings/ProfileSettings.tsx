// src/components/settings/ProfileSettings.tsx
import React from "react";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

interface ProfileSettingsProps {
  onSuccess?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSuccess }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <ProfileSettingsForm onSuccess={onSuccess} />
    </div>
  );
};

export default ProfileSettings;