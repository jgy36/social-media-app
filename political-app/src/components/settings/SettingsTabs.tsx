// src/components/settings/SettingsTabs.tsx
import React, { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Eye, Bell, Shield, UserCog } from "lucide-react";

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: ReactNode;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  children 
}) => {
  // Ensure children is an array
  const childrenArray = React.Children.toArray(children);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-6">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" /> Profile
        </TabsTrigger>
        <TabsTrigger value="account" className="flex items-center gap-2">
          <UserCog className="h-4 w-4" /> Account
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center gap-2">
          <Eye className="h-4 w-4" /> Privacy
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        {childrenArray[0]}
      </TabsContent>
      <TabsContent value="account">
        {childrenArray[1]}
      </TabsContent>
      <TabsContent value="privacy">
        {childrenArray[2]}
      </TabsContent>
      <TabsContent value="notifications">
        {childrenArray[3]}
      </TabsContent>
      <TabsContent value="security">
        {childrenArray[4]}
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;