// src/pages/settings.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

import {
  SettingsTabs,
  ProfileSettings,
  AccountSettings,
  PrivacySettings,
  NotificationSettings,
  SecuritySettings,
} from "@/components/settings";

const Settings = () => {
  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState<string>("profile");
  const user = useSelector((state: RootState) => state.user);
  
  // Set active tab from URL parameter
  useEffect(() => {
    if (tab && typeof tab === "string") {
      // Only set if it's a valid tab
      const validTabs = ["profile", "account", "privacy", "notifications", "security"];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [tab]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container max-w-4xl mx-auto p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>
          
          <SettingsTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          >
            <ProfileSettings />
            <AccountSettings />
            <PrivacySettings />
            <NotificationSettings />
            <SecuritySettings />
          </SettingsTabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Settings;