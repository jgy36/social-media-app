// hooks/useRestoreCommunities.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchAndRestoreUserCommunities } from '@/redux/slices/communitySlice';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

/**
 * Hook to ensure user communities are loaded
 * Can be used in layout components to guarantee communities are available
 */
export const useRestoreCommunities = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const joinedCommunities = useSelector((state: RootState) => state.communities.joinedCommunities);
  
  // Reset mounted state on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle app state changes to refresh communities when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && isAuthenticated && isMounted.current) {
        // Refresh communities when app becomes active after being in background
        checkAndRestoreCommunities();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated]);

  const checkAndRestoreCommunities = async () => {
    // Only run if user is authenticated and communities haven't been loaded yet
    if (isAuthenticated && joinedCommunities.length === 0 && !hasChecked && isMounted.current) {
      setHasChecked(true);
      setIsLoading(true);
      
      try {
        console.log('Restoring communities for authenticated user...');
        await dispatch(fetchAndRestoreUserCommunities()).unwrap();
      } catch (error) {
        console.error('Error restoring communities:', error);
        // Reset hasChecked on error so it can be retried
        setHasChecked(false);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }
  };
  
  // Use focus effect to handle screen focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated && joinedCommunities.length === 0 && !hasChecked) {
        checkAndRestoreCommunities();
      }
    }, [isAuthenticated, joinedCommunities.length, hasChecked])
  );

  // Main effect for handling authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      checkAndRestoreCommunities();
    } else {
      // Reset state when user logs out
      setHasChecked(false);
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Return loading state for components that need it
  return {
    loading: isLoading || (isAuthenticated && joinedCommunities.length === 0 && !hasChecked),
    communitiesCount: joinedCommunities.length,
    isAuthenticated,
    hasChecked,
    refresh: () => {
      if (isAuthenticated) {
        setHasChecked(false);
        checkAndRestoreCommunities();
      }
    }
  };
};