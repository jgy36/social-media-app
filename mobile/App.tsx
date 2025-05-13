// App.tsx - React Native version
import './global.css';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { store, persistor } from './src/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './src/redux/store';
import { initializeBadges } from './src/redux/slices/badgeSlice';
import { restoreAuthState } from './src/redux/slices/userSlice';

// Import your screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FeedScreen from './src/screens/FeedScreen';
import CommunitiesListScreen from './src/screens/community/CommunitiesListScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

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
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Community" component={CommunitiesListScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
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