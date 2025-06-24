// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Import existing screens
import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import VerifyScreen from "../screens/VerifyScreen";
import FeedScreen from "../screens/FeedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import FollowRequestsScreen from "../screens/FollowRequestsScreen";
import CommunitiesListScreen from "../screens/community/CommunitiesListScreen";
import CommunityDetailScreen from "../screens/community/CommunityDetailScreen";
import CreateCommunityScreen from "../screens/community/CreateCommunityScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import SavedPostsScreen from "../screens/SavedPostsScreen";
import HashtagScreen from "../screens/HashtagScreen";
import DebugScreen from "../screens/DebugScreen";
import OAuthConnectSuccessScreen from "../screens/OAuthConnectSuccessScreen";

// Import new screens (we'll create these next)
import ExploreScreen from "../screens/ExploreScreen";
import MessagesScreen from "../screens/MessagesScreen";
import DatingScreen from "../screens/DatingScreen";
import DatingSetupScreen from "../screens/dating/DatingSetupScreen";
import SwipeScreen from "../screens/dating/SwipeScreen";
import MatchDetailScreen from "../screens/dating/MatchDetailScreen";
import PhotoCameraScreen from "../screens/messages/PhotoCameraScreen";
import PhotoViewerScreen from "../screens/messages/PhotoViewerScreen";
import PhotoConversationScreen from "../screens/messages/PhotoConversationScreen";

import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// New 5-tab structure for social media + dating app
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case "Feed":
              iconName = "home";
              break;
            case "Explore":
              iconName = "search";
              break;
            case "Messages":
              iconName = "photo-camera"; // Camera icon for photo messaging
              break;
            case "Dating":
              iconName = "favorite"; // Heart icon for dating/swiping
              break;
            case "Profile":
              iconName = "person";
              break;
            default:
              iconName = "help";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E91E63", // Pink color for dating app theme
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#000", // Dark theme
          borderTopColor: "#333",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarLabel: "Snap" }}
      />
      <Tab.Screen
        name="Dating"
        component={DatingScreen}
        options={{ tabBarLabel: "Dating" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="Verify" component={VerifyScreen} />
          </>
        ) : (
          // Authenticated screens
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />

            {/* Profile screens */}
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
              name="FollowRequests"
              component={FollowRequestsScreen}
            />

            {/* Community screens */}
            <Stack.Screen
              name="Communities"
              component={CommunitiesListScreen}
            />
            <Stack.Screen
              name="CommunityDetail"
              component={CommunityDetailScreen}
            />
            <Stack.Screen
              name="CreateCommunity"
              component={CreateCommunityScreen}
            />

            {/* Post screens */}
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />

            {/* Dating screens */}
            <Stack.Screen
              name="DatingSetup"
              component={DatingSetupScreen}
              options={{
                headerShown: true,
                title: "Complete Your Dating Profile",
                headerStyle: { backgroundColor: "#000" },
                headerTintColor: "#fff",
              }}
            />
            <Stack.Screen name="SwipeScreen" component={SwipeScreen} />
            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />

            {/* Photo Message screens */}
            <Stack.Screen
              name="PhotoCamera"
              component={PhotoCameraScreen}
              options={{
                headerShown: false,
                presentation: "fullScreenModal",
              }}
            />
            <Stack.Screen
              name="PhotoViewer"
              component={PhotoViewerScreen}
              options={{
                headerShown: false,
                presentation: "fullScreenModal",
              }}
            />
            <Stack.Screen
              name="PhotoConversation"
              component={PhotoConversationScreen}
            />

            {/* Hashtag screens */}
            <Stack.Screen name="Hashtag" component={HashtagScreen} />

            {/* Other screens */}
            <Stack.Screen name="Debug" component={DebugScreen} />
            <Stack.Screen
              name="OAuthConnectSuccess"
              component={OAuthConnectSuccessScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
