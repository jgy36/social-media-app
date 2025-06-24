// src/screens/dating/MatchDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { PostType } from "@/types/post";

const { width } = Dimensions.get("window");

const MatchDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { matchId } = route.params as { matchId: number };
  const currentUser = useSelector((state: RootState) => state.user);

  const [matchData, setMatchData] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, using mock data since we need to implement the actual API calls
    loadMatchDetails();
  }, []);

  const loadMatchDetails = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      const mockMatch = {
        id: matchId,
        user1: { id: 1, username: "currentuser", displayName: "Current User" },
        user2: { id: 2, username: "matcheduser", displayName: "Sarah Wilson" },
        matchedAt: new Date().toISOString(),
        isActive: true,
      };

      const mockOtherUser = {
        id: 2,
        username: "matcheduser",
        displayName: "Sarah Wilson",
        bio: "Love hiking, photography, and good coffee ☕ Adventure seeker looking for genuine connections 🌟",
        location: "New York, NY",
        age: 28,
        photos: [
          "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
        ],
        followerCount: 234,
        followingCount: 189,
        postCount: 67,
      };

      // Mock posts that matches can see (limited)
      const mockPosts = [
        {
          id: 1,
          author: "matcheduser",
          content: "Beautiful sunset from my weekend hike! 🌅",
          likes: 45,
          isLiked: false,
          commentsCount: 8,
          createdAt: "2024-01-15T18:30:00Z",
          media: [
            {
              id: 1,
              mediaType: "image",
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
              altText: "Sunset view",
              width: 600,
              height: 400,
            },
          ],
        },
        {
          id: 2,
          author: "matcheduser",
          content: "Coffee and good vibes ☕ Perfect start to the day",
          likes: 23,
          isLiked: false,
          commentsCount: 5,
          createdAt: "2024-01-14T09:15:00Z",
          hashtags: ["coffee", "morning", "goodvibes"],
        },
      ];

      setMatchData(mockMatch);
      setOtherUser(mockOtherUser);
      setPosts(mockPosts);
    } catch (error) {
      console.error("Failed to load match details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoto = () => {
    navigation.navigate("PhotoCamera", { recipientId: otherUser.id });
  };

  const handleViewProfile = () => {
    navigation.navigate("UserProfile", { username: otherUser.username });
  };

  const renderPhoto = (photo: string, index: number) => (
    <Image
      key={index}
      source={{ uri: photo }}
      style={{
        width: (width - 48) / 3,
        height: 120,
        marginRight: index % 3 !== 2 ? 8 : 0,
        marginBottom: 8,
      }}
      className="rounded-lg"
      resizeMode="cover"
    />
  );

  const renderPost = (post: PostType) => (
    <View key={post.id} className="bg-gray-900 rounded-lg p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`,
          }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="text-white font-semibold">
            {otherUser.displayName}
          </Text>
          <Text className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text className="text-white mb-3 leading-5">{post.content}</Text>

      {post.media && post.media.length > 0 && (
        <Image
          source={{ uri: post.media[0].url }}
          style={{ width: "100%", height: 200 }}
          className="rounded-lg mb-3"
          resizeMode="cover"
        />
      )}

      <View className="flex-row items-center">
        <View className="flex-row items-center mr-6">
          <MaterialIcons name="favorite-border" size={20} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">{post.likes}</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="chat-bubble-outline" size={20} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">
            {post.commentsCount}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading match details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-semibold">Match Profile</Text>

        <TouchableOpacity onPress={handleViewProfile}>
          <MaterialIcons name="more-vert" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Match Header */}
        <View className="items-center py-6 px-4">
          <View className="relative">
            <Image
              source={{ uri: otherUser.photos[0] }}
              className="w-32 h-32 rounded-full"
            />
            <View className="absolute -bottom-2 -right-2 w-10 h-10 bg-pink-500 rounded-full items-center justify-center border-2 border-black">
              <MaterialIcons name="favorite" size={20} color="white" />
            </View>
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            {otherUser.displayName}
          </Text>
          <Text className="text-gray-400 text-base">
            {otherUser.age} • {otherUser.location}
          </Text>

          <Text className="text-pink-500 text-sm mt-2 font-medium">
            ✨ You matched on{" "}
            {new Date(matchData.matchedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 mb-6">
          <TouchableOpacity
            onPress={handleSendPhoto}
            className="flex-1 bg-pink-500 rounded-full py-4 mr-2"
          >
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="photo-camera" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Send Snap</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PhotoConversation", { userId: otherUser.id })
            }
            className="flex-1 border border-pink-500 rounded-full py-4 ml-2"
          >
            <View className="flex-row items-center justify-center">
              <MaterialIcons name="chat" size={20} color="#E91E63" />
              <Text className="text-pink-500 font-semibold ml-2">Chat</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">About</Text>
          <Text className="text-gray-300 leading-6">{otherUser.bio}</Text>
        </View>

        {/* Photos */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">Photos</Text>
          <View className="flex-row flex-wrap">
            {otherUser.photos.map((photo: string, index: number) =>
              renderPhoto(photo, index)
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Social Media
          </Text>
          <View className="flex-row bg-gray-900 rounded-lg p-4">
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">
                {otherUser.postCount}
              </Text>
              <Text className="text-gray-400 text-sm">Posts</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">
                {otherUser.followerCount}
              </Text>
              <Text className="text-gray-400 text-sm">Followers</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-white text-xl font-bold">
                {otherUser.followingCount}
              </Text>
              <Text className="text-gray-400 text-sm">Following</Text>
            </View>
          </View>
        </View>

        {/* Recent Posts */}
        <View className="px-4 mb-8">
          <Text className="text-white text-lg font-semibold mb-3">
            Recent Posts
          </Text>
          <Text className="text-gray-400 text-sm mb-4">
            You can see their recent posts because you matched!
          </Text>
          {posts.map(renderPost)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MatchDetailScreen;
