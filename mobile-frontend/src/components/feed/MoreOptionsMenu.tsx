// src/components/feed/MoreOptionsMenu.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Modal } from "react-native";

interface MoreOptionsMenuProps {
  postId: number;
  postContent: string;
  onDelete: (postId: number) => Promise<void>;
  onEdit: () => void;
}

const MoreOptionsMenu = ({
  postId,
  postContent,
  onDelete,
  onEdit,
}: MoreOptionsMenuProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsMenuVisible(false);
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await onDelete(postId);
            } catch (error) {
              console.error("Error deleting post:", error);
              Alert.alert(
                "Error",
                "Failed to delete the post. Please try again."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setIsMenuVisible(false);
    onEdit();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsMenuVisible(true)}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
        disabled={isDeleting}
      >
        <MaterialIcons name="more-vert" size={20} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl m-6 min-w-[280px]">
            {/* Header */}
            <View className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                Post Options
              </Text>
            </View>

            {/* Menu Options */}
            <View className="py-2">
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-row items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <MaterialIcons name="edit" size={20} color="#3B82F6" />
                <Text className="ml-3 text-base font-medium text-gray-900 dark:text-white">
                  Edit Post
                </Text>
              </TouchableOpacity>

              <View className="h-px bg-gray-200 dark:bg-gray-700 mx-4" />

              <TouchableOpacity
                onPress={handleDelete}
                className="flex-row items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <MaterialIcons name="delete" size={20} color="#EF4444" />
                <Text className="ml-3 text-base font-medium text-red-600 dark:text-red-400">
                  Delete Post
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <View className="border-t border-gray-200 dark:border-gray-700">
              <TouchableOpacity
                onPress={() => setIsMenuVisible(false)}
                className="py-4 items-center"
              >
                <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MoreOptionsMenu;
