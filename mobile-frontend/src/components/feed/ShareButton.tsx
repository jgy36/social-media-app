// src/components/feed/ShareButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Share,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";

interface ShareButtonProps {
  postId: number;
  sharesCount?: number;
}

const ShareButton = ({ postId, sharesCount = 0 }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    const postUrl = `${
      process.env.EXPO_PUBLIC_WEB_URL || "https://yourapp.com"
    }/post/${postId}`;
    await Clipboard.setStringAsync(postUrl);

    console.log("Link copied to clipboard");
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    const postUrl = `${
      process.env.EXPO_PUBLIC_WEB_URL || "https://yourapp.com"
    }/post/${postId}`;

    try {
      await Share.share({
        message: `Check out this post: ${postUrl}`,
        url: postUrl,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openTwitterShare = async () => {
    const postUrl = `${
      process.env.EXPO_PUBLIC_WEB_URL || "https://yourapp.com"
    }/post/${postId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      postUrl
    )}`;

    try {
      await Linking.openURL(twitterUrl);
      setIsOpen(false);
    } catch (error) {
      console.error("Error opening Twitter:", error);
    }
  };

  const openFacebookShare = async () => {
    const postUrl = `${
      process.env.EXPO_PUBLIC_WEB_URL || "https://yourapp.com"
    }/post/${postId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}`;

    try {
      await Linking.openURL(facebookUrl);
      setIsOpen(false);
    } catch (error) {
      console.error("Error opening Facebook:", error);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center rounded-full px-3 py-2 -mx-1"
      >
        <MaterialIcons name="share" size={20} color="#6366F1" />
        <Text className="ml-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {sharesCount > 0 ? sharesCount : "Share"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Post
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this post with others
              </Text>

              <View className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-6">
                <Text
                  className="text-sm text-gray-600 dark:text-gray-400"
                  numberOfLines={1}
                >
                  {`${
                    process.env.EXPO_PUBLIC_WEB_URL || "https://yourapp.com"
                  }/post/${postId}`}
                </Text>
              </View>

              {/* Share options */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleNativeShare}
                  className="flex-row items-center p-4 bg-blue-500 rounded-xl"
                >
                  <MaterialIcons name="share" size={20} color="white" />
                  <Text className="text-white font-semibold ml-3">
                    Share using...
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCopyLink}
                  className="flex-row items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl"
                >
                  <MaterialIcons
                    name="content-copy"
                    size={20}
                    color="#6B7280"
                  />
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-3">
                    Copy Link
                  </Text>
                </TouchableOpacity>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={openTwitterShare}
                    className="flex-1 p-4 border border-gray-300 dark:border-gray-700 rounded-xl items-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                      Twitter
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openFacebookShare}
                    className="flex-1 p-4 border border-gray-300 dark:border-gray-700 rounded-xl items-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                      Facebook
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ShareButton;
