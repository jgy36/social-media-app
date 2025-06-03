// src/components/settings/SettingsTabs.tsx
import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Eye, Bell, Shield, UserCog, LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  disabledMessage?: string;
}

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
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Make sure we're running on the client (to avoid SSR issues)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Define tabs with their accessibility states
  const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: UserCog },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];
  
  // When the route changes, update the active tab in URL
  useEffect(() => {
    // Only run on client
    if (!isClient) return;
    
    const { tab } = router.query;
    
    // If tab is specified in URL and it's different from active tab
    if (tab && typeof tab === 'string' && tabs.some(t => t.id === tab) && tab !== activeTab) {
      onTabChange(tab);
    }
    // If no tab is specified in URL, update URL with the current active tab
    else if (!tab && activeTab) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, tab: activeTab },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.query, activeTab, isClient, onTabChange, router, tabs]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Update URL
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: value },
      },
      undefined,
      { shallow: true }
    );
    
    // Trigger the callback
    onTabChange(value);
  };
  
  // Ensure children is an array
  const childrenArray = React.Children.toArray(children);
  
  if (!isClient) {
    // Return a placeholder while we wait for client-side hydration
    return <div className="animate-pulse h-8 bg-muted rounded w-full mb-6"></div>;
  }
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 md:flex md:w-full">
        {tabs.map(tab => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id} 
            className="flex items-center gap-2"
            disabled={tab.disabled}
          >
            <tab.icon className="h-4 w-4" /> 
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.find(tab => tab.id === activeTab)?.disabled && (
        <Alert variant="default" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {tabs.find(tab => tab.id === activeTab)?.disabledMessage || 
             "This feature is currently unavailable."}
          </AlertDescription>
        </Alert>
      )}

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