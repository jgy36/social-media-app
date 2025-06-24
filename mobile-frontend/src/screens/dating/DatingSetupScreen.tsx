// src/screens/dating/DatingSetupScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  getCurrentDatingProfile,
  createOrUpdateDatingProfile,
} from "@/api/dating";

const DatingSetupScreen = () => {
  const navigation = useNavigation();

  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [genderPreference, setGenderPreference] = useState("Everyone");
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("50");
  const [maxDistance, setMaxDistance] = useState("25");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const profile = await getCurrentDatingProfile();
      if (profile) {
        setBio(profile.bio || "");
        setAge(profile.age?.toString() || "");
        setLocation(profile.location || "");
        setPhotos(profile.photos || []);
        setGenderPreference(profile.genderPreference || "Everyone");
        setMinAge(profile.minAge?.toString() || "18");
        setMaxAge(profile.maxAge?.toString() || "50");
        setMaxDistance(profile.maxDistance?.toString() || "25");
      }
    } catch (error) {
      console.error("Failed to load existing profile:", error);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant photo access to add photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validation
    if (!bio.trim()) {
      Alert.alert("Error", "Please add a bio");
      return;
    }

    if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
      Alert.alert("Error", "Please enter a valid age (18-100)");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Error", "Please add your location");
      return;
    }

    if (photos.length === 0) {
      Alert.alert("Error", "Please add at least one photo");
      return;
    }

    try {
      setLoading(true);

      await createOrUpdateDatingProfile({
        bio: bio.trim(),
        age: parseInt(age),
        location: location.trim(),
        photos,
        genderPreference,
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        maxDistance: parseInt(maxDistance),
      });

      Alert.alert(
        "Success!",
        "Your dating profile has been saved. You can now start swiping!",
        [
          {
            text: "Start Swiping",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to save dating profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">
            Dating Profile
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text
              className={`text-lg font-semibold ${
                loading ? "text-gray-500" : "text-pink-500"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photos Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Add Photos ({photos.length}/6)
          </Text>
          <Text className="text-gray-400 text-sm mb-4">
            Add at least one photo. Your first photo will be your main profile
            photo.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {photos.map((photo, index) => (
              <View key={index} className="relative mr-3">
                <Image
                  source={{ uri: photo }}
                  className="w-24 h-32 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                >
                  <MaterialIcons name="close" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 6 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-24 h-32 bg-gray-800 rounded-lg items-center justify-center border-2 border-dashed border-gray-600"
              >
                <MaterialIcons name="add" size={32} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Bio Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            About You
          </Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people about yourself..."
            placeholderTextColor="#6B7280"
            className="bg-gray-900 text-white p-4 rounded-lg h-24"
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text className="text-gray-500 text-sm mt-2">
            {bio.length}/500 characters
          </Text>
        </View>

        {/* Basic Info */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Basic Info
          </Text>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="25"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 text-white p-4 rounded-lg"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="New York, NY"
              placeholderTextColor="#6B7280"
              className="bg-gray-900 text-white p-4 rounded-lg"
            />
          </View>
        </View>

        {/* Preferences */}
        <View className="mb-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Dating Preferences
          </Text>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">
              I'm interested in
            </Text>
            <View className="flex-row">
              {["Men", "Women", "Everyone"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setGenderPreference(option)}
                  className={`mr-3 px-4 py-2 rounded-full border ${
                    genderPreference === option
                      ? "bg-pink-500 border-pink-500"
                      : "border-gray-600"
                  }`}
                >
                  <Text
                    className={`${
                      genderPreference === option
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Age Range</Text>
            <View className="flex-row items-center">
              <TextInput
                value={minAge}
                onChangeText={setMinAge}
                className="bg-gray-900 text-white p-3 rounded-lg flex-1 mr-3"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text className="text-gray-400 mx-2">to</Text>
              <TextInput
                value={maxAge}
                onChangeText={setMaxAge}
                className="bg-gray-900 text-white p-3 rounded-lg flex-1 ml-3"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-300 text-sm mb-2">
              Maximum Distance ({maxDistance} miles)
            </Text>
            <TextInput
              value={maxDistance}
              onChangeText={setMaxDistance}
              className="bg-gray-900 text-white p-3 rounded-lg"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-lg mb-8 ${
            loading ? "bg-gray-600" : "bg-pink-500"
          }`}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {loading ? "Saving Profile..." : "Save & Start Dating"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DatingSetupScreen;
