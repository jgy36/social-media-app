// src/hooks/useRestoreCommunities.ts
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchAndRestoreUserCommunities } from '@/redux/slices/communitySlice';

/**
 * Hook to ensure user communities are loaded
 * Can be used in layout components to guarantee communities are available
 */
export const useRestoreCommunities = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasChecked, setHasChecked] = useState(false);
  
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const joinedCommunities = useSelector((state: RootState) => state.communities.joinedCommunities);
  
  useEffect(() => {
    const checkAndRestoreCommunities = async () => {
      // Only run if user is authenticated and communities haven't been loaded yet
      if (isAuthenticated && joinedCommunities.length === 0 && !hasChecked) {
        setHasChecked(true);
        console.log('Restoring communities for authenticated user...');
        dispatch(fetchAndRestoreUserCommunities());
      }
    };
    
    checkAndRestoreCommunities();
  }, [isAuthenticated, joinedCommunities.length, hasChecked, dispatch]);
  
  // Return loading state for components that need it
  return {
    loading: isAuthenticated && joinedCommunities.length === 0 && !hasChecked,
    communitiesCount: joinedCommunities.length
  };
};