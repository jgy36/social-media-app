// src/screens/FeedScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import PostList from '../components/feed/PostList';
import PostForm from '../components/feed/PostForm';
import FeedTabs from '../components/feed/FeedTabs';

const FeedScreen = () => {
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'communities'>('for-you');
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  // Function to handle post creation and refresh feed
  const handlePostCreated = () => {
    setIsPostModalVisible(false);
    // The PostList component will handle refreshing via the refreshFeed event
    window.dispatchEvent(new CustomEvent('refreshFeed'));
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header with Tabs */}
      <View className="bg-white dark:bg-gray-800 shadow-sm">
        <FeedTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </View>

      {/* Posts List */}
      <PostList activeTab={activeTab} />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => setIsPostModalVisible(true)}
      >
        <MaterialIcons name="edit" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={isPostModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPostModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-center"
        >
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 min-h-[50%] mx-4 mt-auto">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                Create a new post
              </Text>
              <TouchableOpacity 
                onPress={() => setIsPostModalVisible(false)} 
                className="p-2"
              >
                <MaterialIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Post Form */}
            <PostForm onPostCreated={handlePostCreated} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default FeedScreen;