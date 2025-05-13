// src/components/community/NotificationToggle.tsx
import React, { useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { 
  setNotificationPreference, 
  toggleNotificationPreference 
} from '@/redux/slices/notificationPreferencesSlice';
import { Bell, BellOff } from 'react-native-vector-icons/Feather';

interface NotificationToggleProps {
  communityId: string;
  initialState?: boolean;
}
 
const NotificationToggle: React.FC<NotificationToggleProps> = ({ 
  communityId,
  initialState 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get notification state from Redux
  const notificationEnabled = useSelector(
    (state: RootState) => state.notificationPreferences.communityPreferences[communityId] ?? false
  );
  
  // Get the whole preferences object to check if we need to initialize
  const allPreferences = useSelector(
    (state: RootState) => state.notificationPreferences.communityPreferences
  );
  
  const isLoading = useSelector(
    (state: RootState) => state.notificationPreferences.isLoading
  );
  
  // Initialize state from prop if needed
  useEffect(() => {
    const hasExistingPreference = communityId in allPreferences;
    
    if (initialState !== undefined && !hasExistingPreference) {
      console.log(`Initializing notification state for ${communityId} to ${initialState}`);
      dispatch(setNotificationPreference({ 
        communityId, 
        enabled: initialState 
      }));
    }
  }, [communityId, initialState, dispatch, allPreferences]);
  
  // Debug log whenever the notification state changes
  useEffect(() => {
    console.log(`Current notification state for ${communityId}: ${notificationEnabled}`);
  }, [communityId, notificationEnabled]);
  
  // Handle toggle
  const handleToggle = () => {
    console.log(`Toggling notification for ${communityId} from ${notificationEnabled} to ${!notificationEnabled}`);
    dispatch(toggleNotificationPreference(communityId));
  };
  
  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      className={`flex-row items-center justify-center p-2 border rounded-md ${
        notificationEnabled 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950" 
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="gray" />
      ) : notificationEnabled ? (
        <Bell name="bell" size={16} color="#3B82F6" />
      ) : (
        <BellOff name="bell-off" size={16} color="gray" />
      )}
    </TouchableOpacity>
  );
};

export default NotificationToggle;