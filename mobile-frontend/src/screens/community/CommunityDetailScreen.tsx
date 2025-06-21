// src/screens/community/CommunityDetailScreen.tsx - Modern X-style Design with Working Inline Input
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import LoadingState from "@/components/ui/LoadingState";

// Import community-specific components
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityTabs from "@/components/community/CommunityTabs";
import CommunityInfo from "@/components/community/CommunityInfo";

// Import types and hooks
import { Community } from "@/api/types";
import { CommunityData } from "@/types/community";
import { PostType } from "@/types/post";
import { useCommunity } from "@/hooks/useCommunity";
import { createCommunityPost } from "@/api/communities";
import { createPost, CreatePostRequest } from "@/api/posts";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

const CommunityDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  // State for inline post creation
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Common emojis for quick access
  const commonEmojis = [
    "😀",
    "😂",
    "❤️",
    "👍",
    "👎",
    "🔥",
    "💯",
    "🤔",
    "😎",
    "🙌",
    "👏",
    "💪",
    "🎉",
    "🚀",
    "💡",
  ];

  // Use our custom hook to manage community data
  const {
    community,
    posts,
    error,
    isLoading,
    isJoined,
    memberCount,
    handleToggleMembership,
    handlePostCreated,
  } = useCommunity(id, undefined, undefined, undefined);

  // Handle image selection
  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Handle emoji insertion
  const handleEmojiSelect = (emoji: string) => {
    setPostText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle poll toggle
  const handlePollToggle = () => {
    setIsPollMode(!isPollMode);
    if (!isPollMode) {
      setPollOptions(["", ""]);
    }
  };

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  // Update poll option
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  // Clear all media/poll content
  const clearContent = () => {
    setSelectedImage(null);
    setIsPollMode(false);
    setPollOptions(["", ""]);
    setShowEmojiPicker(false);
  };

  // Handle post submission for inline form
  const handleSubmitPost = async () => {
    // Allow posting if we have text, image, or poll
    const hasContent = postText.trim();
    const hasMedia = selectedImage;
    const hasPoll = isPollMode && pollOptions.some((option) => option.trim());

    if (!hasContent && !hasMedia && !hasPoll) {
      return; // Nothing to post
    }

    // Check if backend requires content for media posts
    if (hasMedia && !hasContent && !hasPoll) {
      Alert.alert(
        "Text Required",
        "Posts with images must include text content. Please add a description or caption.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log("🚀 Creating community post with:", {
      text: postText.trim(),
      hasImage: !!selectedImage,
      isPoll: isPollMode,
      communityId: community.id,
    });

    setIsPosting(true);
    try {
      let newPost;

      if (hasMedia) {
        // Use general createPost API for media posts with PROPER FormData construction
        const postData: CreatePostRequest = {
          content: hasContent ? postText.trim() : " ", // Backend requires content
          communityId: parseInt(community.id),
          media: [
            {
              uri: selectedImage,
              type: "image/jpeg",
              name: "community_post_image.jpg",
            },
          ],
          mediaTypes: ["image"],
          altTexts: ["User uploaded image"],
        };

        console.log("📸 Creating media post with communityId:", community.id);
        newPost = await createPost(postData);

        // The backend should now properly associate the post with the community
        console.log("🔍 Backend response communityId:", newPost?.communityId);
      } else {
        // Use community-specific API for text/poll posts (maintains community context)
        let content = postText.trim();

        // Add poll data if in poll mode
        if (isPollMode && pollOptions.some((option) => option.trim())) {
          console.log("📊 Adding poll to community post");
          const validOptions = pollOptions.filter((option) => option.trim());
          const pollText = `Poll:\n${validOptions
            .map((option, index) => `${index + 1}. ${option}`)
            .join("\n")}`;
          content = hasContent ? `${postText.trim()}\n\n${pollText}` : pollText;
        }

        console.log("📝 Creating text post with community API");
        newPost = await createCommunityPost(community.id, content);
      }

      console.log("✅ Post created successfully:", newPost);

      if (newPost) {
        setPostText(""); // Clear the input after successful post
        clearContent(); // Clear all content
        handlePostCreated(); // Refresh the posts list

        // Show different messages based on post type
        if (hasMedia) {
          Alert.alert(
            "Post Created",
            "Your post with image has been created! Note: It may take a moment to appear in the community feed due to a backend limitation.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("❌ Error creating post:", error);

      // Check if it's the content requirement error
      if (
        error.message &&
        error.message.includes("Required part 'content' is not present")
      ) {
        Alert.alert(
          "Text Required",
          "Posts must include text content. Please add a description to your image.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to create post. Please try again.");
      }
    } finally {
      setIsPosting(false);
    }
  };

  // Error state
  if (error || (!isLoading && !community)) {
    return (
      <View className="flex-1 bg-black">
        <View className="p-4">
          <View className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
            <MaterialIcons name="error-outline" size={32} color="#ef4444" />
            <Text className="text-red-400 font-medium mb-2">
              Community not found
            </Text>
            <Text className="text-gray-300 mb-4 text-sm">
              {error ||
                `The community "${id}" doesn't exist or may have been removed.`}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Communities")}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">
                Back to Communities
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading || !community) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <MaterialIcons name="hourglass-empty" size={32} color="#71767b" />
        <Text className="mt-4 text-gray-400 text-sm">Loading community...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header with back button - X-style */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-3 px-4 border-b border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2"
          >
            <MaterialIcons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {community.name}
            </Text>
            <Text className="text-gray-400 text-sm">{memberCount} members</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Community Banner - Compact */}
        {community.banner ? (
          <ImageBackground
            source={{ uri: community.banner }}
            className="w-full h-32 relative"
            style={{
              backgroundColor: community.color || "#1d9bf0",
              zIndex: 1,
            }}
          >
            <View
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            />
          </ImageBackground>
        ) : (
          <View
            className="w-full h-32 relative"
            style={{
              backgroundColor: community.color || "#1d9bf0",
              zIndex: 1,
            }}
          />
        )}

        <View className="px-4 -mt-8 relative" style={{ zIndex: 10 }}>
          {/* Community Header - Compact X-style */}
          <View className="bg-black border border-gray-800 rounded-xl p-4 mb-4 shadow-lg">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  {community.name}
                </Text>
                <Text className="text-gray-400 text-sm mb-2">
                  {community.description}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons name="group" size={14} color="#71767b" />
                  <Text className="text-gray-400 text-xs ml-1">
                    {memberCount.toLocaleString()} members
                  </Text>
                </View>
              </View>

              {/* Join button */}
              <TouchableOpacity
                onPress={handleToggleMembership}
                className="border px-4 py-2 rounded-full ml-3"
                style={{
                  backgroundColor: isJoined ? "#1d9bf0" : "transparent",
                  borderColor: isJoined ? "#1d9bf0" : "#536471",
                }}
              >
                <Text className="font-medium text-sm text-white">
                  {isJoined ? "Joined" : "Join"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Community Rules */}
          {community.rules && community.rules.length > 0 && (
            <View className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4">
              <Text className="text-white font-semibold text-base mb-3">
                Community Rules
              </Text>
              {community.rules.map((rule, index) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-gray-400 text-sm mr-2">
                    {index + 1}.
                  </Text>
                  <Text className="text-gray-300 text-sm flex-1">{rule}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Create Post Form - Enhanced with Media/Poll/Emoji */}
          {isJoined && (
            <View className="bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                {/* User Avatar */}
                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="person" size={20} color="#9ca3af" />
                </View>

                {/* Post Input */}
                <View className="flex-1">
                  <TextInput
                    className="bg-transparent text-white text-base"
                    placeholder={`What's happening in ${community.name}?`}
                    placeholderTextColor="#71767b"
                    value={postText}
                    onChangeText={setPostText}
                    multiline={true}
                    style={{
                      minHeight: 44,
                      maxHeight: 120,
                      textAlignVertical: "top",
                      fontSize: 16,
                      lineHeight: 20,
                    }}
                    editable={!isPosting}
                  />

                  {/* Selected Image Preview */}
                  {selectedImage && (
                    <View className="mt-3 relative">
                      <Image
                        source={{ uri: selectedImage }}
                        className="w-full h-48 rounded-lg"
                        style={{ resizeMode: "cover" }}
                      />
                      <TouchableOpacity
                        onPress={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 bg-black/70 rounded-full p-1"
                      >
                        <MaterialIcons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Poll Creation */}
                  {isPollMode && (
                    <View className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <Text className="text-white text-sm font-medium mb-2">
                        Create a poll
                      </Text>
                      {pollOptions.map((option, index) => (
                        <View
                          key={index}
                          className="flex-row items-center mb-2"
                        >
                          <TextInput
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg mr-2"
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor="#71767b"
                            value={option}
                            onChangeText={(text) =>
                              updatePollOption(index, text)
                            }
                          />
                          {pollOptions.length > 2 && (
                            <TouchableOpacity
                              onPress={() => removePollOption(index)}
                            >
                              <MaterialIcons
                                name="remove-circle"
                                size={20}
                                color="#ef4444"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      {pollOptions.length < 4 && (
                        <TouchableOpacity
                          onPress={addPollOption}
                          className="flex-row items-center mt-1"
                        >
                          <MaterialIcons
                            name="add-circle"
                            size={16}
                            color="#1d9bf0"
                          />
                          <Text className="text-blue-400 text-sm ml-1">
                            Add option
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <View className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <Text className="text-white text-sm font-medium mb-2">
                        Quick emojis
                      </Text>
                      <View className="flex-row flex-wrap">
                        {commonEmojis.map((emoji, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleEmojiSelect(emoji)}
                            className="p-2 m-1 bg-gray-800 rounded-lg"
                          >
                            <Text style={{ fontSize: 20 }}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Post Actions */}
                  <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <View className="flex-row space-x-4">
                      <TouchableOpacity
                        onPress={handleImagePicker}
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: selectedImage
                            ? "rgba(29, 155, 240, 0.2)"
                            : "transparent",
                        }}
                      >
                        <MaterialIcons
                          name="image"
                          size={20}
                          color={selectedImage ? "#1d9bf0" : "#71767b"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handlePollToggle}
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: isPollMode
                            ? "rgba(29, 155, 240, 0.2)"
                            : "transparent",
                        }}
                      >
                        <MaterialIcons
                          name="poll"
                          size={20}
                          color={isPollMode ? "#1d9bf0" : "#71767b"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: showEmojiPicker
                            ? "rgba(29, 155, 240, 0.2)"
                            : "transparent",
                        }}
                      >
                        <MaterialIcons
                          name="emoji-emotions"
                          size={20}
                          color={showEmojiPicker ? "#1d9bf0" : "#71767b"}
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      className="px-5 py-2 rounded-full"
                      style={{
                        backgroundColor:
                          (postText.trim() || selectedImage || isPollMode) &&
                          !isPosting
                            ? "#1d9bf0"
                            : "#0f3460",
                        opacity:
                          (postText.trim() || selectedImage || isPollMode) &&
                          !isPosting
                            ? 1
                            : 0.5,
                      }}
                      onPress={handleSubmitPost}
                      disabled={
                        !(postText.trim() || selectedImage || isPollMode) ||
                        isPosting
                      }
                    >
                      <Text className="text-sm font-bold text-white">
                        {isPosting ? "Posting..." : "Post"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Not joined state - sleek prompt */}
          {!isJoined && (
            <View className="bg-gray-950/50 border border-gray-700/50 rounded-xl p-4 mb-4">
              <View className="flex-row items-center">
                <MaterialIcons name="lock-outline" size={20} color="#71767b" />
                <Text className="text-gray-400 text-sm ml-2 flex-1">
                  Join this community to post and participate
                </Text>
                <TouchableOpacity
                  onPress={handleToggleMembership}
                  className="bg-blue-600 px-3 py-1 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Posts Tab - Simple X-style */}
          <View className="border-b border-gray-800 mb-4">
            <View className="py-3">
              <Text className="text-white font-semibold text-base">Posts</Text>
              <View className="mt-2 h-0.5 w-12 bg-blue-500 rounded-full" />
            </View>
          </View>

          {/* Community Content */}
          <View className="pb-6">
            <CommunityTabs
              posts={posts.map((post) => ({
                ...post,
                communityName: community.name,
                communityColor: community.color,
              }))}
            />
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default CommunityDetailScreen;
