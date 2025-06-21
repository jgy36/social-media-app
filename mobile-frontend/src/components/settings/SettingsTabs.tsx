// components/settings/SettingsTabs.tsx
import React, { ReactNode, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";


interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  disbledMessage?: string;
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
  const [isClient, setIsClient] = useState(false);
  const { tab } = useGlobalSearchParams();
  const screenWidth = Dimensions.get('window').width;
  
  // Make sure we're running on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Define tabs with their accessibility states
  const tabs: TabItem[] = [
    { id: "profile", label: "Profile", icon: "person-outline" },
    { id: "account", label: "Account", icon: "settings-outline" },
    { id: "privacy", label: "Privacy", icon: "eye-outline" },
    { id: "notifications", label: "Notifications", icon: "notifications-outline" },
    { id: "security", label: "Security", icon: "shield-outline" },
  ];
  
  // When the route changes, update the active tab in URL
  useEffect(() => {
    if (!isClient) return;
    
    // If tab is specified in URL and it's different from active tab
    if (tab && typeof tab === 'string' && tabs.some(t => t.id === tab) && tab !== activeTab) {
      onTabChange(tab);
    }
    // If no tab is specified in URL, update URL with the current active tab
    else if (!tab && activeTab) {
      navigation.setParams({ tab: activeTab });
    }
  }, [tab, activeTab, isClient, onTabChange, tabs]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Update URL
    navigation.setParams({ tab: value });
    
    // Trigger the callback
    onTabChange(value);
  };
  
  // Ensure children is an array
  const childrenArray = React.Children.toArray(children);
  
  if (!isClient) {
    // Return a placeholder while we wait for client-side hydration
    return (
      <View className="animate-pulse bg-gray-200 h-12 mx-4 mb-6 rounded-lg" />
    );
  }
  
  // Determine if we should use horizontal scrolling for tabs
  const shouldScrollHorizontally = screenWidth < 768; // Below tablet size
  
  const TabButton = ({ tab, isActive }: { tab: TabItem; isActive: boolean }) => (
    <TouchableOpacity 
      onPress={() => handleTabChange(tab.id)}
      disabled={tab.disabled}
      className={`
        flex-row items-center px-4 py-2 rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-500 shadow-md' 
          : 'bg-gray-100'
        }
        ${tab.disabled ? 'opacity-50' : ''}
        ${shouldScrollHorizontally ? 'mr-3' : 'flex-1'}
      `}
    >
      <Ionicons 
        name={tab.icon} 
        size={20} 
        color={isActive ? 'white' : '#666'} 
      />
      <Text className={`
        ml-2 font-medium 
        ${isActive ? 'text-white' : 'text-gray-700'}
        ${shouldScrollHorizontally ? '' : 'text-center flex-1'}
      `}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
  
  const CurrentTabContent = () => {
    const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    return childrenArray[currentTabIndex] as React.ReactElement || null;
  };
  
  return (
    <View className="flex-1">
      {/* Tab Navigation */}
      <View className="mb-6">
        {shouldScrollHorizontally ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {tabs.map(tab => (
              <TabButton 
                key={tab.id} 
                tab={tab} 
                isActive={tab.id === activeTab}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="flex-row mx-4 space-x-2">
            {tabs.map(tab => (
              <TabButton 
                key={tab.id} 
                tab={tab} 
                isActive={tab.id === activeTab}
              />
            ))}
          </View>
        )}
      </View>
      
      {/* Info Banner for Disabled Tabs */}
      {tabs.find(tab => tab.id === activeTab)?.disabled && (
        <View className="mx-4 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="blue" />
            <Text className="ml-2 text-blue-700 flex-1">
              {tabs.find(tab => tab.id === activeTab)?.disbledMessage || 
               "This feature is currently unavailable."}
            </Text>
          </View>
        </View>
      )}

      {/* Tab Content */}
      <CurrentTabContent />
    </View>
  );
};

export default SettingsTabs;
