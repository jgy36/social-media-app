import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";

import { updatePost } from "@/api/posts";

interface EditPostModalProps {
  postId: number;
  initialContent: string;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  postId,
  initialContent,
  isOpen,
  onClose,
  onPostUpdated,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Reset content when modal opens with new initialContent
  React.useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialContent]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await updatePost(postId, content);
      
      // You might want to show a success notification here
      console.log("Post updated successfully");
      
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      setError("Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/50 justify-center mx-4"
      >
        <View className="bg-white dark:bg-gray-900 rounded-lg p-6 max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Post
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialIcons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Content input */}
          <View className="mb-4">
            <TextInput
              ref={inputRef}
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[120px] text-gray-900 dark:text-white"
              style={{ fontFamily: 'System' }}
            />
          </View>

          {/* Action buttons */}
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-4 items-center"
            >
              <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              className={`flex-1 rounded-lg p-4 items-center ${
                isSubmitting || !content.trim()
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-blue-500 dark:bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <Loader2 size={16} color="white" className="animate-spin" />
                  <Text className="text-white font-semibold ml-2">Updating...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPostModal;