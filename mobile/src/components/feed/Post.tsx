// src/components/feed/Post.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { likePost } from '@/api/posts';
import AuthorAvatar from '@/components/shared/AuthorAvatar';

interface PostProps {
  post: {
    id: number;
    content: string;
    author: string;
    likes: number;
    isLiked: boolean;
    commentsCount: number;
    createdAt: string;
  };
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const router = useRouter();

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
    router.push(`/profile/${post.author}`);
  };

  const handlePostPress = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Author info */}
        <TouchableOpacity 
          onPress={handleAuthorPress}
          className="flex-row items-center mb-3"
        >
          <AuthorAvatar username={post.author} size={32} />
          <Text className="ml-3 font-semibold">{post.author}</Text>
        </TouchableOpacity>
        
        {/* Post content */}
        <TouchableOpacity onPress={handlePostPress}>
          <Text className="text-base leading-6 mb-3">{post.content}</Text>
        </TouchableOpacity>
        
        {/* Actions */}
        <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
          <TouchableOpacity 
            onPress={handleLike}
            className="flex-row items-center"
            disabled={isLiking}
          >
            <Text className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
              ❤️ {likesCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-sm text-gray-500">
              💬 {post.commentsCount || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-sm text-gray-500">
              🔗 Share
            </Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
};

export default Post;