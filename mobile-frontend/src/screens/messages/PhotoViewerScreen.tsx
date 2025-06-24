// src/screens/messages/PhotoViewerScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ScreenCapture from "expo-screen-capture";
import { viewPhotoMessage, reportScreenshot } from "@/api/photoMessages";

const { width, height } = Dimensions.get("window");

const PhotoViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { photoMessageId } = route.params as { photoMessageId: number };

  const [photoData, setPhotoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewStartTime, setViewStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds to view
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPhotoMessage();

    // Listen for screenshots
    const subscription = ScreenCapture.addScreenshotListener(() => {
      handleScreenshot();
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (viewStartTime && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up!
            navigation.goBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, viewStartTime]);

  useEffect(() => {
    if (viewStartTime) {
      // Start progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds
        useNativeDriver: false,
      }).start();
    }
  }, [viewStartTime]);

  const loadPhotoMessage = async () => {
    try {
      setLoading(true);
      const response = await viewPhotoMessage(photoMessageId);

      if (response.success && response.photoUrl) {
        setPhotoData(response);
        setViewStartTime(new Date());
      } else {
        Alert.alert("Error", response.error || "Photo not available", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Failed to load photo message:", error);
      Alert.alert("Error", "Failed to load photo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshot = async () => {
    try {
      await reportScreenshot(photoMessageId);

      // Show screenshot notification
      Alert.alert(
        "Screenshot Detected! 📸",
        "The sender has been notified that you took a screenshot.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to report screenshot:", error);
    }
  };

  const handleReplay = () => {
    if (photoData?.hasReplaysLeft) {
      // Reset timer and restart
      setTimeLeft(10);
      setViewStartTime(new Date());
      progressAnim.setValue(0);

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: false,
      }).start();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-lg">Loading snap...</Text>
      </View>
    );
  }

  if (!photoData) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <MaterialIcons name="error" size={80} color="#6B7280" />
        <Text className="text-white text-xl font-semibold mt-4">
          Snap Not Available
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-pink-500 rounded-full px-6 py-3 mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Progress Bar */}
      <View className="absolute top-12 left-4 right-4 z-10">
        <View className="h-1 bg-gray-600 rounded-full">
          <Animated.View
            className="h-1 bg-white rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
      </View>

      {/* Header */}
      <View className="absolute top-16 left-4 right-4 flex-row items-center justify-between z-10">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${photoData.sender?.username}`,
            }}
            className="w-8 h-8 rounded-full mr-2"
          />
          <Text className="text-white font-semibold">
            {photoData.sender?.username}
          </Text>
          <Text className="text-white ml-2">• {timeLeft}s</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-8 h-8 items-center justify-center"
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {}} // Prevent accidental taps
        className="flex-1"
      >
        <Image
          source={{ uri: photoData.photoUrl }}
          style={{
            width: width,
            height: height,
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Bottom Actions */}
      <View className="absolute bottom-12 left-4 right-4 flex-row items-center justify-between z-10">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PhotoConversation", {
              userId: photoData.sender.id,
            })
          }
          className="bg-gray-800 rounded-full p-3"
        >
          <MaterialIcons name="reply" size={24} color="white" />
        </TouchableOpacity>

        {photoData.hasReplaysLeft && (
          <TouchableOpacity
            onPress={handleReplay}
            className="bg-gray-800 rounded-full p-3"
          >
            <MaterialIcons name="replay" size={24} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PhotoCamera", {
              recipientId: photoData.sender.id,
            })
          }
          className="bg-pink-500 rounded-full p-3"
        >
          <MaterialIcons name="photo-camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* View Count Info */}
      <View className="absolute bottom-4 left-4 right-4 z-10">
        <Text className="text-center text-white text-xs opacity-75">
          Viewed {photoData.viewCount}/{photoData.maxViews} times
          {photoData.hasReplaysLeft && " • Tap replay to view again"}
        </Text>
      </View>
    </View>
  );
};

export default PhotoViewerScreen;
