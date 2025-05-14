// App.tsx - Full navigation with bottom tabs
import './global.css';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { store, persistor } from './src/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './src/redux/store';
import { initializeBadges } from './src/redux/slices/badgeSlice';
import { restoreAuthState } from './src/redux/slices/userSlice';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LandingScreen from './src/screens/LandingScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import FeedScreen from './src/screens/FeedScreen';
import SearchScreen from './src/screens/SearchScreen';
import MapScreen from './src/screens/MapScreen';
import MessageScreen from './src/screens/MessageScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FollowRequestsScreen from './src/screens/FollowRequestsScreen';
import CommunitiesListScreen from './src/screens/community/CommunitiesListScreen';
import CommunityDetailScreen from './src/screens/community/CommunityDetailScreen';
import CreateCommunityScreen from './src/screens/community/CreateCommunityScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import SavedPostsScreen from './src/screens/SavedPostsScreen';
import PoliticiansScreen from './src/screens/PoliticiansScreen';
import PoliticianDetailScreen from './src/screens/PoliticianDetailScreen';
import HashtagScreen from './src/screens/HashtagScreen';
import DebugScreen from './src/screens/DebugScreen';
import OAuthConnectSuccessScreen from './src/screens/OAuthConnectSuccessScreen';

import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main screens
function MainTabNavigator() {
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
            case 'Communities':
              iconName = 'groups';
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
      <Tab.Screen name="Communities" component={CommunitiesListScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthPersistence({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = React.useState(true);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Restore auth state
        await dispatch(restoreAuthState()).unwrap();
        
        // Initialize badges if authenticated
        if (isAuthenticated) {
          dispatch(initializeBadges());
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 16, color: '#666666' }}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function AppNavigator() {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            {/* Main Tab Navigator */}
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            
            {/* Stack screens that overlay the tabs */}
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="FollowRequests" component={FollowRequestsScreen} />
            <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
            <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
            <Stack.Screen name="SavedPosts" component={SavedPostsScreen} />
            <Stack.Screen name="Politicians" component={PoliticiansScreen} />
            <Stack.Screen name="PoliticianDetail" component={PoliticianDetailScreen} />
            <Stack.Screen name="Hashtag" component={HashtagScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} />
            <Stack.Screen name="OAuthConnectSuccess" component={OAuthConnectSuccessScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
        <StatusBar style="auto" />
        <AuthPersistence>
          <AppNavigator />
        </AuthPersistence>
      </PersistGate>
    </Provider>
  );
}