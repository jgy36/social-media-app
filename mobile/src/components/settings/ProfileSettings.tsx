// components/settings/ProfileSettings.tsx
import React from "react";
import { View, Text } from "react-native";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

interface ProfileSettingsProps {
  onSuccess?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSuccess }) => {
  return (
    <View className="flex-1 mt-6">
      <View className="px-4 mb-4">
        <Text className="text-xl font-bold">Settings</Text>
      </View>

      <ProfileSettingsForm onSuccess={onSuccess} />
    </View>
  );
};

export default ProfileSettings;