// src/components/feed/FeedTabs.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface FeedTabsProps {
  activeTab: "for-you" | "following" | "communities";
  onTabChange: (tab: "for-you" | "following" | "communities") => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "for-you", label: "For You" },
    { id: "following", label: "Following" },
    { id: "communities", label: "Communities" },
  ];

  return (
    <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id as "for-you" | "following" | "communities")}
          className={`flex-1 items-center justify-center py-4 px-4 ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500"
              : ""
          }`}
        >
          <Text
            className={`text-sm ${
              activeTab === tab.id
                ? "font-bold text-blue-500"
                : "font-normal text-gray-700 dark:text-gray-300"
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FeedTabs;