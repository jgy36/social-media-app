import { MaterialIcons } from '@expo/vector-icons';
// src/screens/FeedScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PostType } from '../types/post';
import { getFeedPosts } from '../api/posts';
import PostComponent from '../components/feed/PostComponent';
import CreatePostModal from '../components/feed/CreatePostModal'; 


const FeedScreen = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'communities'>('for-you');
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  const loadPosts = async () => {
    try {
      const feedPosts = await getFeedPosts(activeTab);
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const TabButton = ({ id, label, isActive, onPress }: any) => (
    <TouchableOpacity
      className={`flex-1 py-3 items-center ${
        isActive ? 'bg-primary' : 'bg-muted'
      } rounded-lg mx-1`}
      onPress={onPress}
    >
      <Text className={`font-medium ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header with Tabs */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="flex-row mb-4">
          <TabButton
            id="for-you"
            label="For You"
            isActive={activeTab === 'for-you'}
            onPress={() => setActiveTab('for-you')}
          />
          <TabButton
            id="following"
            label="Following"
            isActive={activeTab === 'following'}
            onPress={() => setActiveTab('following')}
          />
          <TabButton
            id="communities"
            label="Communities"
            isActive={activeTab === 'communities'}
            onPress={() => setActiveTab('communities')}
          />
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostComponent post={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        onPress={() => setIsPostModalVisible(true)}
      >
        <PenSquare size={24} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={isPostModalVisible}
        onClose={() => setIsPostModalVisible(false)}
        onPostCreated={() => {
          setIsPostModalVisible(false);
          loadPosts();
        }}
      />
    </View>
  );
};

export default FeedScreen;