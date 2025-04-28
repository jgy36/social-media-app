// src/components/community/NotificationToggle.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { 
  setNotificationPreference, 
  toggleNotificationPreference 
} from '@/redux/slices/notificationPreferencesSlice';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';

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
  // Only set it if we don't have a value in Redux yet
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
    <Button
      variant="outline"
      className={notificationEnabled 
        ? "border-primary/50 text-primary bg-primary/10" 
        : "border-muted"}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={notificationEnabled ? "Disable notifications" : "Enable notifications"}
      data-state={notificationEnabled ? "on" : "off"}
      data-testid="notification-toggle"
      title={notificationEnabled ? "Notifications enabled" : "Notifications disabled"}
    >
      {notificationEnabled ? (
        // When notifications are ON, show the regular bell (no line through it)
        <Bell className="h-4 w-4 text-primary" />
      ) : (
        // When notifications are OFF, show the bell with a line through it
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  );
};

export default NotificationToggle;