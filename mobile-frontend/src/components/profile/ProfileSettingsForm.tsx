import { MaterialIcons } from '@expo/vector-icons';
// src/components/profile/ProfileSettingsForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Alert, Image, Pressable } from 'react-native';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";

import { updateUserProfile } from "@/redux/slices/userSlice";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { updateProfile } from "@/api/users";
import * as ImagePicker from 'expo-image-picker';

interface ProfileSettingsFormProps {
  onSuccess?: () => void;
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  // Form states
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");

      // Set initial image preview
      if (user.profileImageUrl) {
        setImagePreview(getProfileImageUrl(user.profileImageUrl, user.username));
      }
    }
  }, [user]);

  // Handle username validation
  const validateUsername = (value: string): boolean => {
    setUsernameError(null);

    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

    if (!value.trim()) {
      setUsernameError("Username is required");
      return false;
    }

    if (value.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
      return false;
    }

    if (!usernameRegex.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, underscores, and hyphens (3-20 characters)"
      );
      return false;
    }

    return true;
  };

  // Handle display name validation
  const validateDisplayName = (value: string): boolean => {
    setDisplayNameError(null);

    if (!value.trim()) {
      setDisplayNameError("Name is required");
      return false;
    }

    if (value.length > 50) {
      setDisplayNameError("Name must be less than 50 characters");
      return false;
    }

    return true;
  };

  // Handle bio validation
  const validateBio = (value: string): boolean => {
    setBioError(null);

    if (value.length > 250) {
      setBioError("Bio must be less than 250 characters");
      return false;
    }

    return true;
  };

  // Handle image picker
  const handleImagePicker = async () => {
    setImageError(null);
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Check file size (max 5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setImageError("Image size must be less than 5MB");
        return;
      }

      setProfileImageFile(asset);
      setImagePreview(asset.uri);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    setProfileImageFile(null);
    setImagePreview(
      user.profileImageUrl 
        ? getProfileImageUrl(user.profileImageUrl, user.username)
        : null
    );
  };

  // Success notification for image update
  const notifyImageUpdate = useCallback((imageUrl: string) => {
    console.log("Dispatching profileImageUpdated event with:", imageUrl);
    // In React Native, we would use a different event mechanism
    // For now, we'll just handle the update in Redux
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    // Reset validation errors
    setUsernameError(null);
    setDisplayNameError(null);
    setBioError(null);
    setImageError(null);
    setGeneralError(null);
    
    // Validate form fields
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isBioValid = validateBio(bio);
    
    if (!isUsernameValid || !isDisplayNameValid || !isBioValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare profile image data for React Native
      let profileImageToSend;
      if (profileImageFile && profileImageFile.uri) {
        // For React Native, we pass the asset object directly
        // The API should handle this format for React Native uploads
        profileImageToSend = {
          uri: profileImageFile.uri,
          type: profileImageFile.type || 'image/jpeg',
          name: profileImageFile.fileName || 'profile.jpg',
        };
      }

      // Call the API to update profile
      const profileResult = await updateProfile({
        displayName,
        bio,
        profileImage: profileImageToSend,
      });

      console.log("Profile update response:", profileResult);

      if (!profileResult.success) {
        setGeneralError(profileResult.message || "Failed to update profile");
        setIsSubmitting(false);
        return;
      }

      // Handle the updated profile image URL
      if (profileResult.profileImageUrl) {
        console.log("New profile image URL:", profileResult.profileImageUrl);
        
        notifyImageUpdate(profileResult.profileImageUrl);
        
        dispatch(
          updateUserProfile({
            username,
            displayName,
            bio,
            profileImageUrl: profileResult.profileImageUrl,
          })
        );
      } else {
        dispatch(
          updateUserProfile({
            username,
            displayName,
            bio,
          })
        );
      }

      setSuccess(true);
      setFormKey(Date.now());

      // Show success alert
      Alert.alert(
        "Success!",
        "Your profile has been updated successfully."
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = username !== user.username ||
    displayName !== user.displayName ||
    bio !== user.bio ||
    profileImageFile !== null;

  return (
    <ScrollView className="p-4 bg-white dark:bg-gray-900" key={formKey}>
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        {/* Success Message */}
        {success && (
          <View className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mb-4 flex-row items-center">
            <MaterialIcons name="check" size={20} color="#6b7280" />
            <View>
              <Text className="font-medium text-green-700 dark:text-green-300">Success!</Text>
              <Text className="text-green-700 dark:text-green-300">
                Your profile has been updated successfully.
              </Text>
            </View>
          </View>
        )}

        {/* Error Message */}
        {generalError && (
          <View className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3 mb-4 flex-row items-center">
            <MaterialIcons name="error-outline" size={20} color="#6b7280" />
            <View>
              <Text className="font-medium text-red-700 dark:text-red-300">Error</Text>
              <Text className="text-red-700 dark:text-red-300">{generalError}</Text>
            </View>
          </View>
        )}

        {/* Profile Image Section */}
        <View className="items-center mb-6">
          <Text className="text-lg font-medium mb-4 text-black dark:text-white">Profile Photo</Text>
          
          <View className="relative">
            <Image
              source={{
                uri: imagePreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'default'}`
              }}
              className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700"
            />
            
            <View className="absolute -bottom-2 -right-2 flex-row gap-1">
              <Pressable
                onPress={handleImagePicker}
                disabled={isSubmitting}
                className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center"
              >
                <MaterialIcons name="camera-alt" size={16} color="white" />
              </Pressable>
              
              {profileImageFile && (
                <Pressable
                  onPress={handleClearImage}
                  className="w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </Pressable>
              )}
            </View>
          </View>

          {imageError && (
            <Text className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">
              {imageError}
            </Text>
          )}

          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
            Upload a profile picture. Max 5MB.
          </Text>
        </View>

        {/* Display Name Section */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-2 text-black dark:text-white">Full Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            className={`border rounded-lg px-3 py-3 text-base bg-white dark:bg-gray-800 ${
              displayNameError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } text-black dark:text-white`}
            editable={!isSubmitting}
          />
          {displayNameError && (
            <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
              {displayNameError}
            </Text>
          )}
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            This is your public display name. It can be your real name or any name you'd like to be called.
          </Text>
        </View>

        {/* Username Section */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-2 text-black dark:text-white">Username</Text>
          <View className="flex-row items-center border rounded-lg bg-white dark:bg-gray-800">
            <Text className="text-gray-600 dark:text-gray-400 px-3">@</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              className={`flex-1 px-1 py-3 text-base ${
                usernameError ? 'border-red-500' : ''
              } text-black dark:text-white`}
              editable={!isSubmitting}
            />
          </View>
          {usernameError && (
            <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
              {usernameError}
            </Text>
          )}
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens. No spaces allowed.
          </Text>
        </View>

        {/* Bio Section */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2 text-black dark:text-white">Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us a little about yourself"
            multiline
            numberOfLines={4}
            className={`border rounded-lg px-3 py-3 text-base bg-white dark:bg-gray-800 ${
              bioError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } text-black dark:text-white`}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
          {bioError && (
            <Text className="text-sm text-red-600 dark:text-red-400 mt-1">
              {bioError}
            </Text>
          )}
          <View className="flex-row justify-between mt-1">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Brief description for your profile. Maximum 250 characters.
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {bio.length}/250
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !hasChanges}
          className={`bg-blue-500 rounded-lg py-3 flex-row items-center justify-center ${
            isSubmitting || !hasChanges ? 'opacity-50' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <Text className="text-white font-medium">Updating...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="save" size={16} color="white" />
              <Text className="text-white font-medium">Save Changes</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default ProfileSettingsForm;