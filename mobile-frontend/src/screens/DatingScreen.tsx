// src/screens/DatingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  isDatingProfileComplete,
  getCurrentDatingProfile,
  getUserMatches,
} from "@/api/dating";
import SwipeCards from "@/components/dating/SwipeCards";
import MatchesList from "@/components/dating/MatchesList";

const DatingScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "matches">(
    "discover"
  );
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatingProfile();
    loadMatches();
  }, []);

  const checkDatingProfile = async () => {
    try {
      const isComplete = await isDatingProfileComplete();
      setHasCompletedProfile(isComplete);

      if (!isComplete) {
        // Show alert and redirect to profile setup
        Alert.alert(
          "Complete Your Dating Profile",
          "You need to complete your dating profile before you can start swiping!",
          [
            {
              text: "Set Up Now",
              onPress: () => navigation.navigate("DatingSetup"),
            },
            {
              text: "Later",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to check dating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    try {
      const userMatches = await getUserMatches();
      setMatches(userMatches);
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  const handleNewMatch = (matchData: any) => {
    // Add new match to the list
    setMatches((prev) => [matchData, ...prev]);

    // Show match notification
    Alert.alert(
      "It's a Match! 💕",
      `You and ${
        matchData.user2.displayName || matchData.user2.username
      } liked each other!`,
      [
        {
          text: "Send Message",
          onPress: () =>
            navigation.navigate("PhotoConversation", {
              userId: matchData.user2.id,
            }),
        },
        {
          text: "Keep Swiping",
          style: "cancel",
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!hasCompletedProfile) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-800">
          <Text className="text-xl font-bold text-white">Dating</Text>
        </View>

        {/* Profile Setup Prompt */}
        <View className="flex-1 items-center justify-center px-8">
          <MaterialIcons name="favorite" size={80} color="#E91E63" />

          <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
            Welcome to Dating!
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8 leading-6">
            Complete your dating profile to start discovering amazing people
            near you. Add photos, write a bio, and set your preferences.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("DatingSetup")}
            className="bg-pink-500 rounded-full px-8 py-4 mb-4"
          >
            <Text className="text-white font-semibold text-lg">
              Complete Your Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="py-2"
          >
            <Text className="text-gray-400 text-base">Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-white">Dating</Text>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => navigation.navigate("DatingSetup")}
              className="p-2 mr-2"
            >
              <MaterialIcons name="settings" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="p-2">
              <MaterialIcons name="filter-list" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Selector */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("discover")}
            className={`mr-8 pb-2 ${
              activeTab === "discover" ? "border-b-2 border-pink-500" : ""
            }`}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === "discover" ? "text-white" : "text-gray-400"
              }`}
            >
              Discover
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("matches")}
            className={`pb-2 ${
              activeTab === "matches" ? "border-b-2 border-pink-500" : ""
            }`}
          >
            <Text
              className={`text-base font-medium ${
                activeTab === "matches" ? "text-white" : "text-gray-400"
              }`}
            >
              Matches ({matches.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "discover" ? (
          <SwipeCards onMatch={handleNewMatch} />
        ) : (
          <MatchesList
            matches={matches}
            onMatchPress={(match) => {
              const otherUser =
                match.user1.id === user.id ? match.user2 : match.user1;
              navigation.navigate("UserProfile", {
                username: otherUser.username,
              });
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DatingScreen;
