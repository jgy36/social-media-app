// Enhanced: AuthContext.tsx - React Native version

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from '@/redux/store';
import { restoreAuthState } from '@/redux/slices/userSlice';

// Define the type for our Auth Context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true
});

// Custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attempt to restore auth state when component mounts
    const restoreAuth = async () => {
      try {
        console.log('🔍 AuthContext: Starting to restore authentication state');
        
        // Log what we have in AsyncStorage before trying to restore
        const storedToken = await AsyncStorage.getItem('token');
        const storedUsername = await AsyncStorage.getItem('username');
        const storedUserId = await AsyncStorage.getItem('userId');
        
        console.log('🔍 AuthContext: AsyncStorage token =', storedToken);
        console.log('🔍 AuthContext: AsyncStorage username =', storedUsername);
        console.log('🔍 AuthContext: AsyncStorage userId =', storedUserId);
        
        const result = await dispatch(restoreAuthState()).unwrap();
        console.log('✅ AuthContext: Successfully restored auth state:', result);
      } catch (error) {
        console.error('❌ AuthContext: Failed to restore authentication state:', error);
      } finally {
        // Set loading to false when restoration attempt is complete
        setIsLoading(false);
        console.log('🔍 AuthContext: Finished loading, isAuthenticated =', !!token);
      }
    };

    restoreAuth();
  }, [dispatch, token]);

  const value = {
    isAuthenticated: !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;