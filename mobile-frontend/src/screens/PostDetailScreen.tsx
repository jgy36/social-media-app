// src/screens/PostDetailScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getPostComments, getPostById, likePost } from "@/api/posts";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import SaveButton from "@/components/feed/SaveButton";
import ShareButton from "@/components/feed/ShareButton";
import RepostButton from "@/components/feed/RepostButton";
import MediaDisplay from "@/components/feed/MediaDisplay";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import CommentModal from "@/components/comments/CommentModal";

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params as { postId: number };
  const user = useSelector((state: RootState) => state.user);

  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [replyPrefill, setReplyPrefill] = useState("");

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch post data
        const postData = await getPostById(postId);
        if (!postData) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }

        setPost(postData);
        setLikesCount(postData.likes || 0);
        setIsLiked(postData.isLiked || false);

        // Fetch comments
        try {
          const commentsData = await getPostComments(postId);
          setComments(commentsData || []);
        } catch (commentError) {
          console.error("Error fetching comments:", commentError);
          setComments([]);
        }
      } catch (err) {
        setError("Error loading post");
        console.error("Error in fetchPostData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleLike = async () => {
    if (!post || !user.token) return;

    try {
      await likePost(post.id);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCommentAdded = async () => {
    if (!post) return;

    try {
      const commentsData = await getPostComments(post.id);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }

    setIsCommentModalOpen(false);
    setReplyPrefill("");
  };

  const handleReply = (username: string) => {
    if (!user.token) {
      (navigation as any).navigate('Login');
      return;
    }

    setReplyPrefill(`@${username} `);
    setIsCommentModalOpen(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading post...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="gray" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Post</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 text-center">{error || "Post not found"}</Text>
          <TouchableOpacity
            onPress={handleBack}
            className="mt-4 bg-blue-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Post</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Post Content */}
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
          <View className="flex-row items-center mb-3">
            <AuthorAvatar username={post.author} size={40} />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-gray-900 dark:text-white">{post.author}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text className="text-gray-900 dark:text-white text-base leading-6 mb-3">
            {post.content}
          </Text>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <MediaDisplay media={post.media} />
          )}

          {/* Action buttons */}
          <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <TouchableOpacity
              onPress={handleLike}
              className="flex-row items-center"
            >
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={24}
                color={isLiked ? "#EF4444" : "#6B7280"}
              />
              <Text className="ml-1 text-gray-600 dark:text-gray-400">{likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsCommentModalOpen(true)}
              className="flex-row items-center"
            >
              <MaterialIcons name="chat-bubble-outline" size={24} color="#6B7280" />
              <Text className="ml-1 text-gray-600 dark:text-gray-400">{comments.length}</Text>
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

        {/* Comments Section */}
        <View className="bg-white dark:bg-gray-900">
          <Text className="text-lg font-semibold p-4 border-b border-gray-100 dark:border-gray-700">
            Comments
          </Text>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} className="p-4 border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-start">
                  <AuthorAvatar username={comment.user?.username || "Anonymous"} size={32} />
                  <View className="ml-3 flex-1">
                    <Text className="font-medium text-gray-900 dark:text-white">
                      {comment.user?.username || "Anonymous"}
                    </Text>
                    <Text className="text-gray-700 dark:text-gray-300 mt-1">
                      {comment.content}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <TouchableOpacity
                        onPress={() => handleReply(comment.user?.username || "Anonymous")}
                        className="mr-4"
                      >
                        <Text className="text-xs text-blue-500">Reply</Text>
                      </TouchableOpacity>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="p-8 items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No comments yet. Be the first to comment!
              </Text>
            </View>
          )}
        </View>

        {/* Add Comment Button */}
        <View className="p-4">
          <TouchableOpacity
            onPress={() => {
              setReplyPrefill("");
              setIsCommentModalOpen(true);
            }}
            className="bg-blue-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Add Comment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Comment Modal */}
      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setReplyPrefill("");
        }}
        onCommentAdded={handleCommentAdded}
        prefillText={replyPrefill}
      />
    </View>
  );
};

export default PostDetailScreen;