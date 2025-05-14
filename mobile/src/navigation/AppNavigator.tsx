// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import VerifyScreen from '../screens/VerifyScreen';
import FeedScreen from '../screens/FeedScreen';
import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/MapScreen';
import MessagesScreen from '../screens/MessageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FollowRequestsScreen from '../screens/FollowRequestsScreen';
import CommunitiesListScreen from '../screens/community/CommunitiesListScreen';
import CommunityDetailScreen from '../screens/community/CommunityDetailScreen';
import CreateCommunityScreen from '../screens/community/CreateCommunityScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import SavedPostsScreen from '../screens/SavedPostsScreen';
import PoliticiansScreen from '../screens/PoliticiansScreen';
import PoliticianDetailScreen from '../screens/PoliticianDetailScreen';
import HashtagScreen from '../screens/HashtagScreen';
import DebugScreen from '../screens/DebugScreen';
import OAuthConnectSuccessScreen from '../screens/OAuthConnectSuccessScreen';

import { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Feed':
              iconName = 'home';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Map':
              iconName = 'map';
              break;
            case 'Messages':
              iconName = 'message';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
            <Stack.Screen name="FollowRequests" component={FollowRequestsScreen} />
            
            {/* Community screens */}
            <Stack.Screen name="Communities" component={CommunitiesListScreen} />
            <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
            <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
            
            {/* Post screens */}
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
            
            {/* Politicians screens */}
            <Stack.Screen name="Politicians" component={PoliticiansScreen} />
            <Stack.Screen name="PoliticianDetail" component={PoliticianDetailScreen} />
            
            {/* Hashtag screens */}
            <Stack.Screen name="Hashtag" component={HashtagScreen} />
            
            {/* Other screens */}
            <Stack.Screen name="Debug" component={DebugScreen} />
            <Stack.Screen name="OAuthConnectSuccess" component={OAuthConnectSuccessScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;