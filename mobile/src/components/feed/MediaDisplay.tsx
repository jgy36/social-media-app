// src/components/feed/MediaDisplay.tsx
import { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, ScrollView, Text } from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { MediaType } from "@/types/post";

interface MediaDisplayProps {
  media: MediaType[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Get base URL from environment or use default
  const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (media && media.length > 0) {
      const selectedMedia = media[selectedMediaIndex];
      if (selectedMedia) {
        setDebugInfo(
          `Original URL: ${selectedMedia.url}, Type: ${selectedMedia.mediaType}`
        );
      }
    }
  }, [media, selectedMediaIndex]);

  if (!media || media.length === 0) return null;

  const selectedMedia = media[selectedMediaIndex];

  // Function to ensure URL has the correct base
  const getFullUrl = (url: string): string => {
    if (!url) return "";

    let fullUrl: string;

    // If URL already has http:// or https://, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      fullUrl = url;
    }
    // If URL starts with /media, prepend BASE_URL
    else if (url.startsWith("/media/")) {
      fullUrl = `${BASE_URL}${url}`;
    }
    // Otherwise, use BASE_URL with the given path
    else {
      fullUrl = `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
    }

    console.log("Full URL:", fullUrl);
    return fullUrl;
  };

  return (
    <View className="mt-3">
      {/* Main media display */}
      <View className="rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
        {selectedMedia.mediaType === "image" || selectedMedia.mediaType === "gif" ? (
          <TouchableOpacity activeOpacity={0.9}>
            <Image
              source={{ uri: getFullUrl(selectedMedia.url) }}
              style={{ width: '100%', height: 300 }}
              resizeMode="contain"
              onError={(error) => {
                console.error("Failed to load image:", getFullUrl(selectedMedia.url));
                console.error("Error details:", error);
              }}
            />
          </TouchableOpacity>
        ) : selectedMedia.mediaType === "video" ? (
          <TouchableOpacity activeOpacity={0.9}>
            <Video
              source={{ uri: getFullUrl(selectedMedia.url) }}
              style={{ width: '100%', height: 300 }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Thumbnails for multiple media */}
      {media.length > 1 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {media.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMediaIndex(index)}
              className={`w-16 h-16 rounded-md overflow-hidden ${
                index === selectedMediaIndex ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                borderWidth: index === selectedMediaIndex ? 2 : 0,
                borderColor: index === selectedMediaIndex ? "#3B82F6" : "transparent",
              }}
            >
              {item.mediaType === "image" || item.mediaType === "gif" ? (
                <Image
                  source={{ uri: getFullUrl(item.thumbnailUrl || item.url) }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : item.mediaType === "video" ? (
                <View className="w-full h-full bg-black items-center justify-center">
                  <MaterialIcons name="movie" size={24} color="white" />
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MediaDisplay;