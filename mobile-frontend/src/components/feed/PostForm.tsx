// src/components/feed/PostForm.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useCreatePost } from "@/hooks/useApi";
import * as ImagePicker from "expo-image-picker";

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const user = useSelector((state: RootState) => state.user);
  const { loading, error, execute: createPost } = useCreatePost();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newFiles = result.assets.slice(0, 4 - mediaFiles.length);
      setMediaFiles([...mediaFiles, ...newFiles]);
      setMediaPreviews([
        ...mediaPreviews,
        ...newFiles.map((asset) => asset.uri),
      ]);
    }
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setLocalError("Please type something. Posts must have text content.");
      return;
    }

    if (!user.token) {
      setLocalError("You must be logged in to post.");
      return;
    }

    setLocalError(null);

    try {
      const result = await createPost({
        content,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      });

      if (result) {
        setContent("");
        setMediaFiles([]);
        setMediaPreviews([]);
        onPostCreated();
      } else {
        setLocalError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setLocalError("Failed to create post. Please try again.");
    }
  };

  const errorMessage = localError || (error ? error.message : null);

  return (
    <View className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 mx-4 my-2">
      {errorMessage && (
        <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <Text className="text-red-800 dark:text-red-200 text-sm">
            {errorMessage}
          </Text>
        </View>
      )}

      <TextInput
        placeholder="What's on your mind?"
        placeholderTextColor="#9CA3AF"
        value={content}
        onChangeText={setContent}
        multiline
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[120px] text-gray-900 dark:text-white text-base"
        textAlignVertical="top"
        editable={!loading}
        style={{ fontFamily: "System" }}
      />

      {/* Media previews */}
      {mediaPreviews.length > 0 && (
        <ScrollView
          horizontal
          className="mt-4"
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row gap-2">
            {mediaPreviews.map((preview, index) => (
              <View
                key={index}
                className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                <Image
                  source={{ uri: preview }}
                  className="w-24 h-24"
                  style={{ width: 96, height: 96 }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                  onPress={() => removeMedia(index)}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center mt-4">
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex-row items-center"
            onPress={pickImage}
            disabled={loading || mediaFiles.length >= 4}
          >
            <MaterialIcons name="image" size={20} color="#3B82F6" />
            <Text className="text-blue-500 text-sm ml-2">Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`px-6 py-3 rounded-lg ${
            loading || (!content.trim() && mediaFiles.length === 0)
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-blue-500 dark:bg-blue-600"
          }`}
          onPress={handleSubmit}
          disabled={loading || (!content.trim() && mediaFiles.length === 0)}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-base ml-2">Posting...</Text>
            </View>
          ) : (
            <Text className="text-white text-base font-medium">Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostForm;
