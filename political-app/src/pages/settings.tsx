// political-app/src/pages/settings.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import SettingsTabs from "@/components/settings/SettingsTabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Set the active tab from URL query parameter (if present)
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    }
  }, [router.query]);

  const handleBack = () => {
    router.push("/profile");
  };

  // Handle tab change (update URL)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(
      {
        pathname: "/settings",
        query: { tab: value },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Button onClick={handleBack} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>

          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange}>
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

export default SettingsPage;