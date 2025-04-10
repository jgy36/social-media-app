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
  
  const isLoading = useSelector(
    (state: RootState) => state.notificationPreferences.isLoading
  );
  
  // Initialize state from prop if provided
  useEffect(() => {
    if (initialState !== undefined && initialState !== notificationEnabled) {
      dispatch(setNotificationPreference({ 
        communityId, 
        enabled: initialState 
      }));
    }
  }, [communityId, initialState, notificationEnabled, dispatch]);
  
  // Handle toggle
  const handleToggle = () => {
    console.log(`Toggling notification for ${communityId} from ${notificationEnabled} to ${!notificationEnabled}`);
    dispatch(toggleNotificationPreference(communityId));
  };
  
  return (
    <Button
      variant="outline"
      className={notificationEnabled ? "border-primary/50" : ""}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={notificationEnabled ? "Disable notifications" : "Enable notifications"}
      data-state={notificationEnabled ? "on" : "off"}
      data-testid="notification-toggle"
    >
      {notificationEnabled ? (
        <Bell className="h-4 w-4 text-primary" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  );
};

export default NotificationToggle;