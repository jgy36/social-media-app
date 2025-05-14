// src/components/feed/Post.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { likePost } from '@/api/posts';
import { PostType } from '@/types/post';
import AuthorAvatar from '@/components/shared/AuthorAvatar';
import SaveButton from '@/components/feed/SaveButton';
import ShareButton from '@/components/feed/ShareButton';
import RepostButton from '@/components/feed/RepostButton';
import MediaDisplay from '@/components/feed/MediaDisplay';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const navigation = useNavigation();

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    
    try {
      await likePost(post.id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAuthorPress = () => {
    (navigation as any).navigate('Profile', { username: post.author });
  };

  const handlePostPress = () => {
    (navigation as any).navigate('PostDetail', { postId: post.id });
  };

  return (
    <View className="bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700">
      {/* Repost indicator */}
      {(post.isRepost === true || post.repost === true) && (
        <View className="mb-3">
          <View className="flex-row items-center">
            <MaterialIcons name="repeat" size={16} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
              Reposted{post.originalAuthor ? ` from @${post.originalAuthor}` : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Author info */}
      <TouchableOpacity 
        onPress={handleAuthorPress}
        className="flex-row items-center mb-3"
      >
        <AuthorAvatar username={post.author} size={40} />
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 dark:text-white">{post.author}</Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Post content */}
      <TouchableOpacity onPress={handlePostPress} className="mb-3">
        <Text className="text-gray-900 dark:text-white text-base leading-6">
          {post.content}
        </Text>
      </TouchableOpacity>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View className="mb-3">
          <MediaDisplay media={post.media} />
        </View>
      )}
      
      {/* Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <TouchableOpacity 
          onPress={handleLike}
          className="flex-row items-center"
          disabled={isLiking}
        >
          <MaterialIcons
            name={isLiked ? "favorite" : "favorite-border"}
            size={20}
            color={isLiked ? "#EF4444" : "#6B7280"}
          />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            {likesCount}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handlePostPress}
          className="flex-row items-center"
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#6B7280" />
          <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
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