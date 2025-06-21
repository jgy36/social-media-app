import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { restoreAuthState } from '@/redux/slices/userSlice';
import { checkAuthStatus } from '@/api/auth';
import { isAuthenticated as checkIsAuthenticated } from '@/utils/tokenUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (isAuthenticated) {
          setIsLoading(false);
          return;
        }
        
        if (checkIsAuthenticated()) {
          await dispatch(restoreAuthState()).unwrap();
          setIsLoading(false);
          return;
        }
        
        const authWithServer = await checkAuthStatus();
        if (authWithServer) {
          await dispatch(restoreAuthState()).unwrap();
          setIsLoading(false);
          return;
        }
        
        navigation.navigate('login');
      } catch (error) {
        console.error('Authentication error:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [isAuthenticated, router, dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="mt-4 text-sm text-muted-foreground">Verifying access...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <View className="bg-destructive/10 p-4 rounded-lg max-w-md">
          <Text className="text-lg font-bold mb-2 text-destructive">Something went wrong</Text>
          <Text className="mb-4 text-destructive">There was an error loading this page.</Text>
        </View>
      </View>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
