// src/components/feed/EditPostModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
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
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[90%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Post
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-6">
              {/* Error message */}
              {error && (
                <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                  <Text className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </Text>
                </View>
              )}

              {/* Content input */}
              <View className="mb-6">
                <TextInput
                  ref={inputRef}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#9CA3AF"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                  editable={!isSubmitting}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[120px] text-gray-900 dark:text-white"
                  style={{ fontFamily: "System" }}
                />
              </View>

              {/* Action buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl py-4 items-center"
                >
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || !content.trim()}
                  className={`flex-1 rounded-xl py-4 items-center ${
                    isSubmitting || !content.trim()
                      ? "bg-gray-300 dark:bg-gray-600"
                      : "bg-blue-500 dark:bg-blue-600"
                  }`}
                >
                  {isSubmitting ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Updating...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold">Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditPostModal;
