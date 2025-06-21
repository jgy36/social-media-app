import { MaterialIcons } from "@expo/vector-icons";
// src/screens/community/CreateCommunityScreen.tsx - Modern X-style Design
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.137.1:8080/api";

// Form validation helper
type ValidationErrors = {
  id?: string;
  name?: string;
  description?: string;
  rules?: string;
  general?: string;
};

const CreateCommunityScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  const isAdmin = user.role === "ADMIN";

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [color, setColor] = useState("#1d9bf0");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please login to continue", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }

    if (!isAdmin) {
      Alert.alert(
        "Permission Denied",
        "Only administrators can create communities",
        [{ text: "OK", onPress: () => navigation.navigate("Communities") }]
      );
      return;
    }
  }, [isAuthenticated, isAdmin]);

  // If not admin, show loading state until redirect happens
  if (!isAdmin) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <MaterialIcons name="hourglass-empty" size={32} color="#71767b" />
        <Text className="mt-4 text-gray-400 text-sm">Loading...</Text>
      </View>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!id.trim()) {
      newErrors.id = "Community ID is required";
    } else if (id.length < 3) {
      newErrors.id = "Community ID must be at least 3 characters";
    } else if (id.length > 30) {
      newErrors.id = "Community ID must be less than 30 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      newErrors.id =
        "Only letters, numbers, underscores and hyphens are allowed";
    }

    if (!name.trim()) {
      newErrors.name = "Community name is required";
    } else if (name.length < 3) {
      newErrors.name = "Community name must be at least 3 characters";
    } else if (name.length > 50) {
      newErrors.name = "Community name must be less than 50 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Community description is required";
    } else if (description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (rules.length > 1000) {
      newErrors.rules = "Rules must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      // Create community object
      const newCommunity = {
        id,
        name,
        description,
        rules: rules.split("\n").filter((rule) => rule.trim().length > 0),
        color,
      };

      // Send to backend
      const response = await axios.post<{ id: string }>(
        `${API_BASE_URL}/communities`,
        newCommunity,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Show success message
      Alert.alert("Success!", "Your community has been created");

      // Redirect to the new community
      navigation.navigate("CommunityDetail", { id: response.data.id });
    } catch (error) {
      console.error("Error creating community:", error);

      const axiosError = error as any;
      if (axiosError.response) {
        if (axiosError.response.status === 400) {
          setErrors((prev) => ({
            ...prev,
            id: "Community ID already exists. Please choose another one.",
          }));
        } else {
          Alert.alert(
            "Error",
            axiosError.response?.data?.error || "Failed to create community"
          );
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }

      setIsCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header - X-style */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-3 px-4 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-white text-base">Cancel</Text>
          </TouchableOpacity>

          <Text className="text-white text-lg font-semibold">
            Create Community
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isCreating}
            className="bg-blue-600 px-4 py-1.5 rounded-full"
            style={{
              opacity: isCreating ? 0.7 : 1,
            }}
          >
            <Text className="text-white font-medium text-sm">
              {isCreating ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* General error */}
        {errors.general && (
          <View className="mt-4 p-3 bg-red-950 border border-red-800 rounded-lg">
            <Text className="text-red-400 text-sm">{errors.general}</Text>
          </View>
        )}

        {/* Form fields */}
        <View className="py-6 space-y-6">
          {/* Community ID */}
          <View>
            <Text className="text-white text-base font-medium mb-2">
              Community ID
            </Text>
            <TextInput
              className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg text-base"
              style={{ borderColor: errors.id ? "#ef4444" : "#374151" }}
              value={id}
              onChangeText={setId}
              placeholder="e.g. political-discussion"
              placeholderTextColor="#71767b"
              maxLength={30}
              editable={!isCreating}
            />
            {errors.id && (
              <Text className="text-red-400 text-sm mt-1">{errors.id}</Text>
            )}
            <Text className="text-gray-400 text-xs mt-1">
              This will be used in your community URL
            </Text>
          </View>

          {/* Community Name */}
          <View>
            <Text className="text-white text-base font-medium mb-2">
              Community Name
            </Text>
            <TextInput
              className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg text-base"
              style={{ borderColor: errors.name ? "#ef4444" : "#374151" }}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Political Discussion"
              placeholderTextColor="#71767b"
              maxLength={50}
              editable={!isCreating}
            />
            {errors.name && (
              <Text className="text-red-400 text-sm mt-1">{errors.name}</Text>
            )}
            <Text className="text-gray-400 text-xs mt-1">
              Display name for your community
            </Text>
          </View>

          {/* Community Description */}
          <View>
            <Text className="text-white text-base font-medium mb-2">
              Description
            </Text>
            <TextInput
              className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg text-base"
              style={{
                borderColor: errors.description ? "#ef4444" : "#374151",
                height: 100,
                textAlignVertical: "top",
              }}
              value={description}
              onChangeText={setDescription}
              placeholder="What is your community about?"
              placeholderTextColor="#71767b"
              editable={!isCreating}
              multiline
              numberOfLines={4}
            />
            {errors.description && (
              <Text className="text-red-400 text-sm mt-1">
                {errors.description}
              </Text>
            )}
            <Text className="text-gray-400 text-xs mt-1">
              Tell people what your community is about
            </Text>
          </View>

          {/* Community Rules */}
          <View>
            <Text className="text-white text-base font-medium mb-2">
              Community Rules (Optional)
            </Text>
            <TextInput
              className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg text-base"
              style={{
                borderColor: errors.rules ? "#ef4444" : "#374151",
                height: 120,
                textAlignVertical: "top",
              }}
              value={rules}
              onChangeText={setRules}
              placeholder="Enter one rule per line"
              placeholderTextColor="#71767b"
              editable={!isCreating}
              multiline
              numberOfLines={5}
            />
            {errors.rules && (
              <Text className="text-red-400 text-sm mt-1">{errors.rules}</Text>
            )}
            <Text className="text-gray-400 text-xs mt-1">
              Enter one rule per line. You can edit these later.
            </Text>
          </View>

          {/* Information note */}
          <View className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <View className="flex-row">
              <MaterialIcons
                name="info-outline"
                size={18}
                color="#71767b"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text className="text-gray-300 text-sm flex-1 leading-5">
                By creating a community, you agree to moderate it according to
                platform guidelines. You'll automatically become its first
                member and moderator.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default CreateCommunityScreen;
