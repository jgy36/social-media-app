// src/components/profile/SettingsDropdown.tsx
import React, { useState } from "react";
import { View, Text, Pressable, Modal } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userSlice";
import { AppDispatch } from "@/redux/store";
import { useTheme } from "@/hooks/useTheme";

interface SettingsDropdownProps {
  variant?: "icon" | "text";
}

const SettingsDropdown = ({ variant = "icon" }: SettingsDropdownProps) => {
  const { theme, setTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setIsVisible(false);
  };

  const handleNavigation = (path: string) => {
    setIsVisible(false);
    navigation.navigate(path);
  };

  const MenuItem = ({ 
    iconName, 
    iconLibrary = 'Ionicons',
    title, 
    onPress, 
    isDestructive = false 
  }: {
    iconName: string;
    iconLibrary?: 'Ionicons' | 'MaterialIcons';
    title: string;
    onPress: () => void;
    isDestructive?: boolean;
  }) => {
    const IconComponent = iconLibrary === 'MaterialIcons' ? MaterialIcons : Ionicons;
    
    return (
      <Pressable 
        onPress={onPress}
        className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800"
      >
        <View className="flex-row items-center flex-1">
          <IconComponent 
            name={iconName as any} 
            size={20} 
            color={isDestructive ? "#dc2626" : "#6b7280"} 
          />
          <Text className={`ml-3 text-base ${
            isDestructive 
              ? "text-red-600 dark:text-red-400" 
              : "text-black dark:text-white"
          }`}>
            {title}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={16} color="#6b7280" />
      </Pressable>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <Pressable onPress={() => setIsVisible(true)}>
        {variant === "icon" ? (
          <View className="w-10 h-10 rounded-full items-center justify-center">
            <MaterialIcons name="settings" size={20} color="#6b7280" />
          </View>
        ) : (
          <View className="flex-row items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
            <MaterialIcons name="settings" size={16} color="#6b7280" />
            <Text className="text-black dark:text-white">Settings</Text>
          </View>
        )}
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 bg-white dark:bg-gray-900">
          {/* Header */}
          <View className="p-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-black dark:text-white">Settings</Text>
              <Pressable onPress={() => setIsVisible(false)} className="p-2">
                <Text className="text-blue-500 font-medium">Done</Text>
              </Pressable>
            </View>
          </View>

          {/* Menu Items */}
          <View className="flex-1">
            {/* Account Section */}
            <View className="mt-4">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                My Account
              </Text>
              
              <MenuItem
                iconName="person-outline"
                title="Profile"
                onPress={() => handleNavigation('Profile')}
              />
              
              <MenuItem
                iconName="bookmark-outline"
                title="Saved Posts"
                onPress={() => handleNavigation('SavedPosts')}
              />
              
              <MenuItem
                iconName="settings-outline"
                title="Account Settings"
                onPress={() => handleNavigation('Settings')}
              />
              
              <MenuItem
                iconName="eye-outline"
                title="Privacy"
                onPress={() => handleNavigation('Settings')}
              />
              
              <MenuItem
                iconName="notifications-outline"
                title="Notifications"
                onPress={() => handleNavigation('Settings')}
              />
              
              <MenuItem
                iconName="person-add-outline"
                title="Follow Requests"
                onPress={() => handleNavigation('FollowRequests')}
              />
            </View>

            {/* App Section */}
            <View className="mt-6">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                App
              </Text>
              
              <MenuItem
                iconName={theme === "dark" ? "sunny-outline" : "moon-outline"}
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                onPress={toggleTheme}
              />
            </View>

            {/* Support Section */}
            <View className="mt-6">
              <Text className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Support
              </Text>
              
              <MenuItem
                iconName="help-circle-outline"
                title="Help & Support"
                onPress={() => handleNavigation('Help')}
              />
              
              <MenuItem
                iconName="shield-outline"
                title="Security"
                onPress={() => handleNavigation('Settings')}
              />
            </View>

            {/* Logout */}
            <View className="mt-6">
              <MenuItem
                iconName="log-out-outline"
                title="Logout"
                onPress={handleLogout}
                isDestructive={true}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SettingsDropdown;