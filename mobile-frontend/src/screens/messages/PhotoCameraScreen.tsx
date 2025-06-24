// src/screens/messages/PhotoCameraScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { sendPhotoMessage } from "@/api/photoMessages";

const { width, height } = Dimensions.get("window");

const PhotoCameraScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { recipientId } = route.params as { recipientId?: number };

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (recipientId) {
          await handleSendPhoto(photo.uri);
        } else {
          // Navigate to recipient selection or show success
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const pickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please grant photo access");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (recipientId) {
          await handleSendPhoto(result.assets[0].uri);
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error picking from library:", error);
      Alert.alert("Error", "Failed to pick photo");
    }
  };

  const handleSendPhoto = async (photoUri: string) => {
    if (!recipientId) {
      Alert.alert("Error", "No recipient selected");
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendPhotoMessage(recipientId, photoUri);

      if (response.success) {
        Alert.alert(
          "Photo Sent! 📸",
          "Your photo message has been sent successfully!",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error(response.error || "Failed to send photo");
      }
    } catch (error) {
      console.error("Failed to send photo:", error);
      Alert.alert("Error", "Failed to send photo message");
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-8">
        <MaterialIcons name="camera-alt" size={80} color="#6B7280" />
        <Text className="text-white text-xl font-semibold mt-6 mb-4">
          Camera Access Needed
        </Text>
        <Text className="text-gray-400 text-center mb-8">
          Please grant camera access to take photos for your snaps.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-pink-500 rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera ref={cameraRef} style={{ flex: 1 }} type={type} ratio="16:9">
        {/* Header */}
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-4 py-3">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center"
            >
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>

            <Text className="text-white font-semibold text-lg">
              {recipientId ? "Send Snap" : "Take Photo"}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                )
              }
              className="w-10 h-10 items-center justify-center"
            >
              <MaterialIcons name="flip-camera-ios" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Camera Controls */}
        <View className="absolute bottom-0 left-0 right-0 pb-8">
          <SafeAreaView>
            <View className="flex-row items-center justify-center px-8">
              {/* Photo Library */}
              <TouchableOpacity
                onPress={pickFromLibrary}
                className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center"
              >
                <MaterialIcons name="photo-library" size={24} color="white" />
              </TouchableOpacity>

              {/* Capture Button */}
              <TouchableOpacity
                onPress={takePicture}
                disabled={isLoading}
                className="w-20 h-20 bg-white rounded-full items-center justify-center mx-8 border-4 border-gray-300"
              >
                {isLoading ? (
                  <View className="w-16 h-16 bg-gray-400 rounded-full" />
                ) : (
                  <View className="w-16 h-16 bg-white rounded-full" />
                )}
              </TouchableOpacity>

              {/* Flash Toggle */}
              <TouchableOpacity className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center">
                <MaterialIcons name="flash-auto" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {recipientId && (
              <Text className="text-white text-center mt-4 text-sm">
                This photo will disappear after being viewed twice
              </Text>
            )}
          </SafeAreaView>
        </View>
      </Camera>
    </View>
  );
};

export default PhotoCameraScreen;
