import { MaterialIcons } from "@expo/vector-icons";
// src/components/profile/BadgeSelector.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setBadges } from "@/redux/slices/badgeSlice";
import { saveUserBadges } from "@/api/badges";
import {
  availableBadges,
  getCategories,
  getBadgesByCategory,
} from "@/types/badges";

interface BadgeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBadges: string[];
}

const BadgeSelector: React.FC<BadgeSelectorProps> = ({
  isOpen,
  onClose,
  selectedBadges: initialSelectedBadges,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const categories = getCategories();
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize selected badges when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBadges(initialSelectedBadges || []);
      setErrorMessage(null);
    }
  }, [isOpen, initialSelectedBadges]);

  // Toggle badge selection
  const toggleBadge = (badgeId: string) => {
    setSelectedBadges((prev) => {
      // If already selected, remove it
      if (prev.includes(badgeId)) {
        return prev.filter((id) => id !== badgeId);
      }

      // If we're at the max limit, show error and don't add
      if (prev.length >= 10) {
        setErrorMessage("You can select a maximum of 10 badges.");
        return prev;
      }

      // Clear error if there was one
      setErrorMessage(null);

      // Add the new badge
      return [...prev, badgeId];
    });
  };

  // Save selected badges
  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await saveUserBadges(selectedBadges);

      if (result.success) {
        dispatch(setBadges(selectedBadges));
        onClose();
      } else {
        setErrorMessage("Failed to save badges. Please try again.");
      }
    } catch (error) {
      console.error("Error saving badges:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90%] p-6">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-black dark:text-white">
                  Select Your Political Position Badges
                </Text>
                <Pressable onPress={onClose} className="p-2">
                  <MaterialIcons name="close" size={24} color="#6b7280" />
                </Pressable>
              </View>

              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose up to 10 badges that represent your political positions
                and values.
              </Text>

              {/* Error Message */}
              {errorMessage && (
                <View className="bg-red-100 dark:bg-red-900/20 rounded-lg p-3 mb-4">
                  <Text className="text-red-700 dark:text-red-300">
                    {errorMessage}
                  </Text>
                </View>
              )}

              {/* Badge Counter and Clear All */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-sm text-gray-600 dark:text-gray-400">
                  <Text className="font-medium">{selectedBadges.length}</Text>{" "}
                  of <Text className="font-medium">10</Text> badges selected
                </Text>
                <Pressable
                  onPress={() => setSelectedBadges([])}
                  disabled={selectedBadges.length === 0 || isSubmitting}
                  className={`px-3 py-2 rounded-lg ${
                    selectedBadges.length === 0 || isSubmitting
                      ? "opacity-50"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Clear All
                  </Text>
                </Pressable>
              </View>

              {/* Selected Badges */}
              {selectedBadges.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-medium mb-2 text-black dark:text-white">
                    Selected Badges:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                  >
                    <View className="flex-row gap-2">
                      {selectedBadges.map((badgeId) => {
                        const badge = availableBadges.find(
                          (b) => b.id === badgeId
                        );
                        if (!badge) return null;

                        return (
                          <Pressable
                            key={badgeId}
                            onPress={() => toggleBadge(badgeId)}
                            className="bg-blue-500 rounded-full px-3 py-2 flex-row items-center gap-1"
                          >
                            <Text className="text-white text-sm">
                              {badge.name}
                            </Text>
                            <View className="bg-white/20 rounded-full w-5 h-5 items-center justify-center">
                              <Text className="text-white text-xs">×</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Categories */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View className="flex-row gap-2">
                  {categories.map((category) => (
                    <Pressable
                      key={category}
                      onPress={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-lg ${
                        activeCategory === category
                          ? "bg-blue-500"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          activeCategory === category
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Badge Grid */}
              <ScrollView
                className="flex-1 px-1"
                showsVerticalScrollIndicator={false}
              >
                <View className="flex-row flex-wrap gap-2 pb-4">
                  {getBadgesByCategory(activeCategory).map((badge) => {
                    const isSelected = selectedBadges.includes(badge.id);

                    return (
                      <Pressable
                        key={badge.id}
                        onPress={() => toggleBadge(badge.id)}
                        className={`flex-row items-center px-3 py-2 rounded-lg border ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                        }`}
                        style={{ minWidth: "45%" }}
                      >
                        {isSelected && (
                          <MaterialIcons name="check" size={16} color="white" />
                        )}
                        <Text
                          className={`text-sm flex-1 ${
                            isSelected
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {badge.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Footer Buttons */}
              <View className="flex-row gap-3 mt-4">
                <Pressable
                  onPress={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-500 rounded-lg flex-row items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <MaterialIcons name="refresh" size={16} color="white" />
                  )}
                  <Text className="text-white font-medium">Save Badges</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BadgeSelector;
