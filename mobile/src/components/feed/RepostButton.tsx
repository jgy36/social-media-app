import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'expo-router';
import { useCreatePost } from '@/hooks/useApi';

interface RepostButtonProps {
  postId: number;
  author: string;
  content: string;
  repostsCount?: number;
}

const RepostButton = ({
  postId,
  author,
  content,
  repostsCount = 0,
}: RepostButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { execute: createPost } = useCreatePost();

  const handleOpenRepost = (e: React.EventObject) => {
    if (!user.token) {
      router.push(`/login`);
      return;
    }

    setIsOpen(true);
  };

  const handleRepost = async () => {
    if (!user.token) return;

    setIsReposting(true);

    try {
      // Check that post ID is valid
      if (!postId || isNaN(Number(postId)) || postId <= 0) {
        throw new Error("Invalid original post ID");
      }

      // Create the repost request using the field name expected by the backend
      const postData = {
        content: repostComment,
        originalPostId: postId,
        repost: true,
      };

      // Create the repost
      const result = await createPost(postData);

      if (result) {
        // Success notification (you might want to use a toast library here)
        console.log("Post reposted successfully");

        // Refresh feed
        // You might want to trigger a feed refresh here

        setIsOpen(false);
        setRepostComment("");
      } else {
        throw new Error("Failed to repost");
      }
    } catch (error) {
      console.error("Error reposting:", error);
      // Show error message
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenRepost}
        className="flex-row items-center"
      >
        <Repeat size={20} color="#22c55e" />
        <Text className="ml-1 text-gray-600 dark:text-gray-400">
          {repostsCount > 0 ? repostsCount : "Repost"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 min-h-[50%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Repost this content
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2">
                <MaterialIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Original post preview */}
            <View className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4">
              <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <Text className="text-white text-xs font-semibold">
                    {author.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="ml-2 font-medium text-gray-900 dark:text-white">
                  @{author}
                </Text>
              </View>
              <Text className="text-gray-800 dark:text-gray-200 text-sm">
                {content}
              </Text>
            </View>

            {/* Optional comment */}
            <TextInput
              placeholder="Add a comment (optional)"
              value={repostComment}
              onChangeText={setRepostComment}
              multiline
              textAlignVertical="top"
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-24 text-gray-900 dark:text-white"
              style={{ fontFamily: 'System' }}
            />

            {/* Action buttons */}
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                disabled={isReposting}
                className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-4 items-center"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleRepost}
                disabled={isReposting}
                className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-lg p-4 items-center"
              >
                {isReposting ? (
                  <View className="flex-row items-center">
                    <Text className="text-white font-semibold">Reposting...</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Repeat size={16} color="white" />
                    <Text className="text-white font-semibold ml-2">Repost</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default RepostButton;