// src/screens/FeedScreen.tsx - Modern X-style Design
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import PostList from "../components/feed/PostList";
import PostForm from "../components/feed/PostForm";

const FeedScreen = () => {
  const [activeTab, setActiveTab] = useState<
    "for-you" | "following" | "communities"
  >("for-you");
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  // Function to handle post creation and refresh feed
  const handlePostCreated = () => {
    setIsPostModalVisible(false);
    // The PostList component will handle refreshing via the refreshFeed event
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("refreshFeed"));
    }
  };

  // Tab data for easier management
  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "following", label: "Following" },
    { id: "communities", label: "Communities" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View className="flex-1 bg-black">
        {/* Header - Minimal X-style */}
        <View className="bg-black/95 backdrop-blur-md border-b border-gray-800">
          {/* Top section with logo/title */}
          <View className="px-4 pt-2 pb-3">
            <Text className="text-xl font-bold text-white">Home</Text>
          </View>

          {/* Tabs - X-style compact design */}
          <View className="flex-row">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                className="flex-1 pb-3 pt-1"
              >
                <Text
                  className="text-center text-[15px] font-medium"
                  style={{
                    color: activeTab === tab.id ? "#ffffff" : "#71767b",
                  }}
                >
                  {tab.label}
                </Text>
                {/* Active indicator */}
                <View
                  className="mt-3 h-1 rounded-full mx-auto"
                  style={{
                    width: activeTab === tab.id ? 32 : 0,
                    backgroundColor:
                      activeTab === tab.id ? "#1d9bf0" : "transparent",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Posts List */}
        <View className="flex-1">
          <PostList activeTab={activeTab} />
        </View>

        {/* Floating Action Button - X-style */}
        <TouchableOpacity
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full items-center justify-center"
          style={{
            backgroundColor: "#1d9bf0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => setIsPostModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>

        {/* Create Post Modal - X-style */}
        <Modal
          visible={isPostModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsPostModalVisible(false)}
          presentationStyle="pageSheet"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View
              className="flex-1 justify-end"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <View className="bg-black rounded-t-2xl border-t border-gray-800">
                {/* Modal Header - X-style */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
                  <TouchableOpacity
                    onPress={() => setIsPostModalVisible(false)}
                    className="px-2 py-1"
                  >
                    <Text className="text-white text-base">Cancel</Text>
                  </TouchableOpacity>

                  <Text className="text-white text-lg font-semibold">
                    New post
                  </Text>

                  <View className="w-12" />
                </View>

                {/* Modal Body */}
                <View className="px-4 py-4" style={{ maxHeight: 400 }}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    bounces={false}
                  >
                    <PostForm onPostCreated={handlePostCreated} />
                  </ScrollView>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default FeedScreen;
