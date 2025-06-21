import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import ProfileSettings from "../components/settings/ProfileSettings";
import AccountSettings from "../components/settings/AccountSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [currentView, setCurrentView] = useState("main"); // 'main' or specific setting
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const settingsOptions = [
    {
      id: "profile",
      label: "Profile Settings",
      icon: "person",
      description: "Edit your profile information",
    },
    {
      id: "account",
      label: "Account Settings",
      icon: "manage-accounts",
      description: "Manage your account preferences",
    },
    {
      id: "privacy",
      label: "Privacy & Safety",
      icon: "shield",
      description: "Control your privacy settings",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
      description: "Manage notification preferences",
    },
    {
      id: "security",
      label: "Security",
      icon: "security",
      description: "Password and security settings",
    },
  ];

  const renderSettingContent = (settingId: string) => {
    switch (settingId) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings />;
      case "privacy":
        return <PrivacySettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  const handleSettingPress = (settingId: string) => {
    if (expandedSection === settingId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(settingId);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header - X-style */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2"
          >
            <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Settings List */}
        <View className="px-4 py-6">
          {settingsOptions.map((option, index) => (
            <View key={option.id} className="mb-4">
              {/* Setting Item */}
              <TouchableOpacity
                className="bg-gray-950 border border-gray-800 rounded-xl p-4"
                onPress={() => handleSettingPress(option.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center mr-3">
                      <MaterialIcons
                        name={option.icon as any}
                        size={20}
                        color="#ffffff"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base font-semibold">
                        {option.label}
                      </Text>
                      <Text className="text-gray-400 text-sm mt-1">
                        {option.description}
                      </Text>
                    </View>
                  </View>

                  <MaterialIcons
                    name={
                      expandedSection === option.id
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={24}
                    color="#71767b"
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Content */}
              {expandedSection === option.id && (
                <View className="mt-3 bg-gray-900 border border-gray-700 rounded-xl p-4">
                  {renderSettingContent(option.id)}
                </View>
              )}
            </View>
          ))}

          {/* Additional Settings Section */}
          <View className="mt-8 mb-4">
            <Text className="text-gray-400 text-sm font-medium mb-4 px-2">
              OTHER
            </Text>

            {/* Help & Support */}
            <TouchableOpacity className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center mr-3">
                    <MaterialIcons
                      name="help-outline"
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                      Help & Support
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      Get help with your account
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#71767b" />
              </View>
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center mr-3">
                    <MaterialIcons
                      name="info-outline"
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base font-semibold">
                      About
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      App version and information
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#71767b" />
              </View>
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity className="bg-red-950 border border-red-800 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-red-800 rounded-full items-center justify-center mr-3">
                    <MaterialIcons name="logout" size={20} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-red-400 text-base font-semibold">
                      Sign Out
                    </Text>
                    <Text className="text-red-500 text-sm mt-1">
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ef4444" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
