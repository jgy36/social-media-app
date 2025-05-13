import { MaterialIcons } from '@expo/vector-icons';
// src/screens/community/CreateCommunityScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// Form validation helper
type ValidationErrors = {
  id?: string;
  name?: string;
  description?: string;
  rules?: string;
  general?: string;
};

const CreateCommunityScreen = () => {
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  const isAdmin = user.role === "ADMIN";

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Authentication Required", "Please login to continue", [
        { text: "OK", onPress: () => router.push("/login") }
      ]);
      return;
    }
    
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only administrators can create communities", [
        { text: "OK", onPress: () => router.push("/community") }
      ]);
      return;
    }
  }, [isAuthenticated, isAdmin]);

  // If not admin, show loading state until redirect happens
  if (!isAdmin) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></View>
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
      newErrors.id = "Only letters, numbers, underscores and hyphens are allowed";
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
      router.push(`/community/${response.data.id}`);
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
          Alert.alert("Error", axiosError.response?.data?.error || "Failed to create community");
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }

      setIsCreating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="max-w-3xl mx-auto p-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Create a Community</Text>
          <Text className="text-muted-foreground">
            Create a community to gather people around a shared interest or topic
          </Text>
        </View>

        {errors.general && (
          <View className="mb-6 p-4 bg-destructive/20 rounded-lg border border-destructive">
            <Text className="text-destructive font-semibold">Error</Text>
            <Text className="text-destructive">{errors.general}</Text>
          </View>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <Text className="text-lg font-semibold text-foreground">Community Details</Text>
            <Text className="text-muted-foreground">
              Fill out the information below to create your community
            </Text>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Community ID */}
            <View className="space-y-2">
              <Label className="text-base font-medium">Community ID</Label>
              <Input
                value={id}
                onChangeText={setId}
                placeholder="e.g. political-discussion"
                maxLength={30}
                className={errors.id ? "border-destructive" : ""}
                editable={!isCreating}
              />
              {errors.id && (
                <Text className="text-sm text-destructive">{errors.id}</Text>
              )}
              <Text className="text-xs text-muted-foreground">
                This will be used in your community URL: /community/{id || "example"}
              </Text>
            </View>

            {/* Community Name */}
            <View className="space-y-2">
              <Label className="text-base font-medium">Community Name</Label>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="e.g. Political Discussion"
                maxLength={50}
                className={errors.name ? "border-destructive" : ""}
                editable={!isCreating}
              />
              {errors.name && (
                <Text className="text-sm text-destructive">{errors.name}</Text>
              )}
              <Text className="text-xs text-muted-foreground">
                Display name for your community
              </Text>
            </View>

            {/* Community Description */}
            <View className="space-y-2">
              <Label className="text-base font-medium">Description</Label>
              <Textarea
                value={description}
                onChangeText={setDescription}
                placeholder="What is your community about?"
                className={errors.description ? "border-destructive" : ""}
                editable={!isCreating}
                numberOfLines={4}
              />
              {errors.description && (
                <Text className="text-sm text-destructive">{errors.description}</Text>
              )}
              <Text className="text-xs text-muted-foreground">
                This will be displayed on your community page
              </Text>
            </View>

            {/* Community Rules */}
            <View className="space-y-2">
              <Label className="text-base font-medium">Community Rules (Optional)</Label>
              <Textarea
                value={rules}
                onChangeText={setRules}
                placeholder="Enter one rule per line"
                className={errors.rules ? "border-destructive" : ""}
                editable={!isCreating}
                numberOfLines={5}
              />
              {errors.rules && (
                <Text className="text-sm text-destructive">{errors.rules}</Text>
              )}
              <Text className="text-xs text-muted-foreground">
                Enter one rule per line. You can edit these later.
              </Text>
            </View>

            {/* Information note */}
            <View className="rounded-lg border border-border p-4">
              <View className="flex-row">
                <Info className="h-5 w-5 text-muted-foreground mr-2" />
                <Text className="text-sm text-muted-foreground flex-1">
                  By creating a community, you agree to moderate it according to platform guidelines. 
                  You'll automatically become its first member and moderator.
                </Text>
              </View>
            </View>
          </CardContent>

          <CardFooter className="flex-row justify-between">
            <Button
              variant="outline"
              onPress={() => router.push("/community")}
              disabled={isCreating}
            >
              <Text>Cancel</Text>
            </Button>
            <Button onPress={handleSubmit} disabled={isCreating}>
              {isCreating ? (
                <View className="flex-row items-center">
                  <View className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></View>
                  <Text>Creating...</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <Text>Create Community</Text>
                </View>
              )}
            </Button>
          </CardFooter>
        </Card>
      </View>
    </ScrollView>
  );
};

export default CreateCommunityScreen;