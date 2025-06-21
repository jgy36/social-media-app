// src/components/feed/FeedTabs.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

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
    <View className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      {/* Tab container with rounded background */}
      <View className="bg-gray-100 dark:bg-gray-700 rounded-xl p-1 flex-row">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() =>
              onTabChange(tab.id as "for-you" | "following" | "communities")
            }
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-800 shadow-sm"
                : "bg-transparent"
            }`}
          >
            <Text
              className={`text-center text-lg font-medium ${
                activeTab === tab.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default FeedTabs;
