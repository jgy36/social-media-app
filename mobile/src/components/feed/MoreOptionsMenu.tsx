import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';


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
  onEdit 
}: MoreOptionsMenuProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
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
              Alert.alert("Error", "Failed to delete the post. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  // For React Native, we'll use a simple modal or action sheet
  const showOptions = () => {
    Alert.alert(
      "Post Options",
      "",
      [
        {
          text: "Edit Post",
          onPress: onEdit
        },
        {
          text: "Delete Post",
          style: "destructive",
          onPress: handleDelete
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={showOptions}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      disabled={isDeleting}
    >
      <MoreVertical size={20} color="gray" />
    </TouchableOpacity>
  );
};

export default MoreOptionsMenu;