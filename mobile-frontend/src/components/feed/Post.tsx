// src/components/feed/Post.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { likePost } from "@/api/posts";
import { PostType } from "@/types/post";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import SaveButton from "@/components/feed/SaveButton";
import ShareButton from "@/components/feed/ShareButton";
import RepostButton from "@/components/feed/RepostButton";
import MediaDisplay from "@/components/feed/MediaDisplay";

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  // Use navigation hook with error handling
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.warn("Navigation context not available in Post component");
  }

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);

    try {
      await likePost(post.id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAuthorPress = () => {
    if (navigation) {
      navigation.navigate("Profile", { username: post.author });
    }
  };

  const handlePostPress = () => {
    if (navigation) {
      navigation.navigate("PostDetail", { postId: post.id });
    }
  };

  return (
    <View className="bg-white dark:bg-gray-900 rounded-xl shadow-md border-2 border-black/10 dark:border-white/10 mx-4 mb-4 overflow-hidden">
      {/* Repost indicator */}
      {(post.isRepost === true || post.repost === true) && (
        <View className="px-4 pt-3 pb-1">
          <View className="flex-row items-center">
            <MaterialIcons name="repeat" size={16} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              Reposted
              {post.originalAuthor ? ` from @${post.originalAuthor}` : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Post header with author info */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <TouchableOpacity
          onPress={handleAuthorPress}
          className="flex-row items-center flex-1"
          disabled={!navigation}
        >
          <AuthorAvatar username={post.author} size={40} />
          <View className="ml-3 flex-1">
            <Text className="font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition-colors">
              {post.author}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Community badge */}
        {post.communityName && (
          <View
            className="px-3 py-1 rounded-full border"
            style={{
              borderColor: post.communityColor
                ? `${post.communityColor}50`
                : "#E5E7EB",
              backgroundColor: post.communityColor
                ? `${post.communityColor}10`
                : "#F3F4F6",
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: post.communityColor || "#3B82F6" }}
            >
              {post.communityName}
            </Text>
          </View>
        )}
      </View>

      {/* Post content */}
      <TouchableOpacity
        onPress={handlePostPress}
        className="px-4 py-3"
        disabled={!navigation}
      >
        <Text className="text-gray-900 dark:text-white text-base leading-6">
          {post.content}
        </Text>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <View className="mt-3">
            <MediaDisplay media={post.media} />
          </View>
        )}

        {/* Edited indicator */}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Edited {new Date(post.updatedAt).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Actions */}
      <View className="px-4 py-3 flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center rounded-full px-3 py-2 -mx-1"
          disabled={isLiking}
        >
          <MaterialIcons
            name={isLiked ? "favorite" : "favorite-border"}
            size={20}
            color={isLiked ? "#EF4444" : "#6B7280"}
          />
          <Text
            className={`ml-1 text-sm font-medium ${
              isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePostPress}
          className="flex-row items-center rounded-full px-3 py-2 -mx-1"
          disabled={!navigation}
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#6B7280" />
          <Text className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            {post.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        <SaveButton postId={post.id} isSaved={post.isSaved ?? false} />

        <RepostButton
          postId={post.id}
          author={post.author}
          content={post.content}
          repostsCount={post.repostsCount || 0}
        />

        <ShareButton postId={post.id} sharesCount={post.sharesCount ?? 0} />
      </View>
    </View>
  );
};

export default Post;
