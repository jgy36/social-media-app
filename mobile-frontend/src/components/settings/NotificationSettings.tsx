// components/settings/NotificationSettings.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Switch, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/api/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import * as Notifications from 'expo-notifications';

// Define the notification preferences interface
interface NotificationPreferences {
  emailNotifications: boolean;
  newCommentNotifications: boolean;
  mentionNotifications: boolean;
  politicalUpdates: boolean;
  communityUpdates: boolean;
  directMessageNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    newCommentNotifications: true,
    mentionNotifications: true,
    politicalUpdates: false,
    communityUpdates: true,
    directMessageNotifications: true,
    followNotifications: true,
    likeNotifications: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pushPermissions, setPushPermissions] = useState<Notifications.PermissionStatus | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.user.id);
  
  // Check notification permissions
  useEffect(() => {
    checkNotificationPermissions();
  }, []);
  
  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPushPermissions(status);
  };
  
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPushPermissions(status);
    
    if (status !== Notifications.PermissionStatus.GRANTED) {
      Alert.alert(
        'Notifications Disabled',
        'To receive push notifications, please enable them in your device settings manually.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };
  
  // Fetch current notification settings
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/users/notification-preferences');
        setPreferences(response.data || {});
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        setError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotificationPreferences();
  }, [userId]);
  
  // Handle preference toggling
  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };
  
  // Save preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      await apiClient.put('/users/notification-preferences', preferences);
      
      setSaveSuccess(true);
      setHasChanges(false);
      
      Alert.alert("Success", "Your notification preferences have been updated");
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
      
      Alert.alert("Error", "Failed to save your notification preferences");
    } finally {
      setIsSaving(false);
    }
  };
  
  const NotificationItem = ({ 
    id, 
    label, 
    description, 
    value, 
    onToggle,
    icon
  }: {
    id: string;
    label: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon?: string;
  }) => (
    <View className="py-4 border-b border-gray-100">
      <View className="flex-row justify-between items-center">
        <View className="flex-1 flex-row items-center">
          {icon && <Ionicons name={icon as any} size={20} color="#6B7280" className="mr-3" />}
          <View className="flex-1 mr-4">
            <Text className="font-medium text-base text-gray-900">{label}</Text>
            <Text className="text-sm text-gray-600 mt-1">{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
  
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 m-4">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">Notification Preferences</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Manage how and when you receive notifications.
            </Text>
          </View>
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="bg-white rounded-lg shadow-sm border border-gray-200 m-4">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-xl font-semibold text-gray-900">Notification Preferences</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Manage how and when you receive notifications.
          </Text>
        </View>
        
        <View className="p-4">
          {error && (
            <View className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text className="ml-2 text-red-700 flex-1">{error}</Text>
              </View>
            </View>
          )}
          
          {saveSuccess && (
            <View className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#059669" />
                <Text className="ml-2 text-green-700 flex-1">Notification preferences saved successfully!</Text>
              </View>
            </View>
          )}
          
          {/* Push Notification Permission */}
          <View className="mb-6">
            <View className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Push Notifications</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {pushPermissions === Notifications.PermissionStatus.GRANTED
                      ? 'Enabled - You will receive push notifications' 
                      : 'Disabled - Enable to receive push notifications'}
                  </Text>
                </View>
                {pushPermissions !== Notifications.PermissionStatus.GRANTED && (
                  <TouchableOpacity 
                    onPress={requestNotificationPermissions} 
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Enable</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          <View>
            <NotificationItem
              id="comment-notifications"
              label="New Comment Notifications"
              description="Get notified when someone comments on your post"
              value={preferences.newCommentNotifications}
              onToggle={() => handleTogglePreference('newCommentNotifications')}
              icon="chatbubble-outline"
            />
            
            <NotificationItem
              id="mention-notifications"
              label="Mention Notifications"
              description="Get notified when someone mentions you"
              value={preferences.mentionNotifications}
              onToggle={() => handleTogglePreference('mentionNotifications')}
              icon="at-outline"
            />
            
            <NotificationItem
              id="like-notifications"
              label="Like Notifications"
              description="Get notified when someone likes your post"
              value={preferences.likeNotifications}
              onToggle={() => handleTogglePreference('likeNotifications')}
              icon="heart-outline"
            />
            
            <NotificationItem
              id="follow-notifications"
              label="Follow Notifications"
              description="Get notified when someone follows you"
              value={preferences.followNotifications}
              onToggle={() => handleTogglePreference('followNotifications')}
              icon="person-add-outline"
            />
            
            <NotificationItem
              id="message-notifications"
              label="Direct Message Notifications"
              description="Get notified when you receive a direct message"
              value={preferences.directMessageNotifications}
              onToggle={() => handleTogglePreference('directMessageNotifications')}
              icon="mail-outline"
            />
            
            <NotificationItem
              id="community-updates"
              label="Community Updates"
              description="Receive updates from your communities"
              value={preferences.communityUpdates}
              onToggle={() => handleTogglePreference('communityUpdates')}
              icon="people-outline"
            />
            
            <NotificationItem
              id="political-updates"
              label="Political Updates"
              description="Get notified about important political news and updates"
              value={preferences.politicalUpdates}
              onToggle={() => handleTogglePreference('politicalUpdates')}
              icon="newspaper-outline"
            />
            
            <NotificationItem
              id="email-notifications"
              label="Email Notifications"
              description="Receive notifications via email"
              value={preferences.emailNotifications}
              onToggle={() => handleTogglePreference('emailNotifications')}
              icon="mail-outline"
            />
          </View>
          
          <View className="mt-6 border-t border-gray-200 pt-6">
            <TouchableOpacity 
              onPress={handleSavePreferences} 
              disabled={isSaving || !hasChanges}
              className={`rounded-lg py-3 px-4 flex-row justify-center items-center ${
                isSaving || !hasChanges 
                  ? 'bg-gray-300' 
                  : 'bg-blue-600'
              }`}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">Saving...</Text>
                </>
              ) : (
                <Text className={`font-medium ${
                  isSaving || !hasChanges ? 'text-gray-500' : 'text-white'
                }`}>
                  Save Notification Settings
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NotificationSettings;