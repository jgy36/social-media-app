import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";

import { addComment } from "@/api/posts";

interface CommentModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
  prefillText?: string;
}

const CommentModal = ({ 
  postId, 
  isOpen, 
  onClose, 
  onCommentAdded, 
  prefillText = "" 
}: CommentModalProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Set the initial content when the modal opens or prefillText changes
  useEffect(() => {
    if (isOpen && prefillText) {
      setContent(prefillText);
      
      // Focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else if (!isOpen) {
      // Reset the content when modal closes
      setContent("");
    }
  }, [isOpen, prefillText]);

  const handleComment = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addComment(postId, content);
      setContent("");
      
      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded();
      } else {
        onClose(); // Only close if no callback provided
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
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
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 min-h-[40%]">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Add a comment
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialIcons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>
          
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}
          
          <TextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            placeholder="Type your comment..."
            editable={!isSubmitting}
            multiline
            textAlignVertical="top"
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-24 text-gray-900 dark:text-white"
            style={{ fontFamily: 'System' }}
          />
          
          <TouchableOpacity 
            onPress={handleComment}
            disabled={isSubmitting || !content.trim()}
            className={`mt-4 rounded-lg p-4 items-center ${
              isSubmitting || !content.trim() 
                ? 'bg-gray-300 dark:bg-gray-700' 
                : 'bg-blue-500 dark:bg-blue-600'
            }`}
          >
            {isSubmitting ? (
              <View className="flex-row items-center">
                <Loader2 size={16} color="white" className="animate-spin" />
                <Text className="text-white ml-2">Posting...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">Post Comment</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentModal;