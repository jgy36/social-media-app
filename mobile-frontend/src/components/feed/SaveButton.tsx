// src/components/feed/SaveButton.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";
import { savePost, checkPostSaveStatus } from "@/api/posts";

interface SaveButtonProps {
  postId: number;
  isSaved: boolean;
}

const SaveButton = ({ postId, isSaved: initialIsSaved }: SaveButtonProps) => {
  const [saved, setSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  // Use navigation hook with error handling
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.warn("Navigation context not available in SaveButton component");
  }

  // Check the actual saved status when component mounts
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!user.token) return;

      try {
        const status = await checkPostSaveStatus(postId);
        if (status) {
          setSaved(status.isSaved);
        }
      } catch (err) {
        console.error("Error checking save status:", err);
        setSaved(initialIsSaved);
      }
    };

    if (user.token) {
      fetchSavedStatus();
    }
  }, [postId, user.token, initialIsSaved]);

  const handleSave = async () => {
    setIsLoading(true);

    if (!user.token) {
      if (navigation) {
        navigation.navigate("Login");
      } else {
        console.warn("Cannot navigate to login - navigation not available");
      }
      setIsLoading(false);
      return;
    }

    try {
      await savePost(postId);

      const newSavedState = !saved;
      setSaved(newSavedState);

      console.log(
        newSavedState
          ? "Post saved successfully"
          : "Post removed from saved items"
      );
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSave}
      disabled={isLoading}
      className="flex-row items-center rounded-full px-3 py-2 -mx-1"
    >
      <MaterialIcons
        name={saved ? "bookmark" : "bookmark-border"}
        size={20}
        color={saved ? "#EAB308" : "#6B7280"}
      />
      <Text
        className={`ml-1 text-sm font-medium ${
          saved ? "text-yellow-500" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {isLoading ? "..." : saved ? "Saved" : "Save"}
      </Text>
    </TouchableOpacity>
  );
};

export default SaveButton;
