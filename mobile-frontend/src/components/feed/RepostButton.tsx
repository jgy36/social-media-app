// src/components/feed/RepostButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import { useCreatePost } from "@/hooks/useApi";

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
  const { execute: createPost } = useCreatePost();

  // Use navigation hook with error handling
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.warn("Navigation context not available in RepostButton component");
  }

  const handleOpenRepost = () => {
    if (!user.token) {
      if (navigation) {
        navigation.navigate("Login");
      } else {
        console.warn("Cannot navigate to login - navigation not available");
      }
      return;
    }

    setIsOpen(true);
  };

  const handleRepost = async () => {
    if (!user.token) return;

    setIsReposting(true);

    try {
      if (!postId || isNaN(Number(postId)) || postId <= 0) {
        throw new Error("Invalid original post ID");
      }

      const postData = {
        content: repostComment,
        originalPostId: postId,
        repost: true,
      };

      const result = await createPost(postData);

      if (result) {
        console.log("Post reposted successfully");
        setIsOpen(false);
        setRepostComment("");
      } else {
        throw new Error("Failed to repost");
      }
    } catch (error) {
      console.error("Error reposting:", error);
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenRepost}
        className="flex-row items-center rounded-full px-3 py-2 -mx-1"
      >
        <MaterialIcons name="repeat" size={20} color="#22C55E" />
        <Text className="ml-1 text-sm font-medium text-green-600 dark:text-green-400">
          {repostsCount > 0 ? repostsCount : "Repost"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[80%]">
              {/* Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                  Repost this content
                </Text>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  <MaterialIcons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="p-6">
                {/* Original post preview */}
                <View className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 bg-gray-50 dark:bg-gray-800/50">
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
                      <Text className="text-white text-sm font-semibold">
                        {author.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text className="ml-3 font-medium text-gray-900 dark:text-white">
                      @{author}
                    </Text>
                  </View>
                  <Text className="text-gray-800 dark:text-gray-200">
                    {content}
                  </Text>
                </View>

                {/* Optional comment */}
                <TextInput
                  placeholder="Add a comment (optional)"
                  placeholderTextColor="#9CA3AF"
                  value={repostComment}
                  onChangeText={setRepostComment}
                  multiline
                  textAlignVertical="top"
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-24 text-gray-900 dark:text-white"
                  style={{ fontFamily: "System" }}
                />

                {/* Action buttons */}
                <View className="flex-row mt-6 gap-3">
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    disabled={isReposting}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-4 items-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRepost}
                    disabled={isReposting}
                    className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-xl py-4 items-center"
                  >
                    {isReposting ? (
                      <View className="flex-row items-center">
                        <Text className="text-white font-semibold">
                          Reposting...
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <MaterialIcons name="repeat" size={16} color="white" />
                        <Text className="text-white font-semibold ml-2">
                          Repost
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default RepostButton;
