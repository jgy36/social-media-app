import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert as RNAlert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { apiClient } from "@/api/apiClient";

// Define simplified privacy settings interface
interface PrivacySettings {
  privateAccount: boolean;
}

// Define the API response interface
interface PrivacySettingsResponse {
  publicProfile: boolean;
  showPoliticalAffiliation?: boolean;
  showPostHistory?: boolean;
  showVotingRecord?: boolean;
  allowDirectMessages?: boolean;
  allowFollowers?: boolean;
  allowSearchIndexing?: boolean;
  dataSharing?: boolean;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    privateAccount: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const userId = useSelector((state: RootState) => state.user.id);
  
  // Fetch current privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get<PrivacySettingsResponse>('/users/privacy-settings');
        
        // Map the existing privacy settings to our simplified model
        // We'll use publicProfile (inverted) as the privateAccount setting
        setSettings({
          privateAccount: response.data.publicProfile === false
        });
        
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        setError('Failed to load privacy settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrivacySettings();
  }, [userId]);
  
  // Handle setting toggling
  const togglePrivateAccount = () => {
    setSettings(prev => ({
      privateAccount: !prev.privateAccount
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Map our simplified settings back to what the API expects
      // The API expects the full privacy settings object
      await apiClient.put('/users/privacy-settings', {
        // Invert privateAccount to get publicProfile
        publicProfile: !settings.privateAccount,
        // Keep other settings with sensible privacy-oriented defaults
        showPoliticalAffiliation: false,
        showPostHistory: !settings.privateAccount, // Hide post history if account is private
        showVotingRecord: false,
        allowDirectMessages: true, // Allow DMs by default
        allowFollowers: true, // We need this to be true for follow requests to work
        allowSearchIndexing: !settings.privateAccount, // Don't index private accounts
        dataSharing: false,
      });
      
      setSaveSuccess(true);
      setHasChanges(false);
      
      RNAlert.alert("Success", "Your privacy settings have been updated");
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setError('Failed to save privacy settings');
      
      RNAlert.alert("Error", "Failed to save your privacy settings");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View className="bg-white rounded-lg shadow-sm border border-gray-200 m-4">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-xl font-semibold text-gray-900">Privacy Settings</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Control your profile visibility and post privacy.
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white rounded-lg shadow-sm border border-gray-200 m-4">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-xl font-semibold text-gray-900">Privacy Settings</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Control who can see your content and how they can interact with you.
          </Text>
        </View>
        
        <View className="p-4 space-y-6">
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text className="text-red-800 text-sm ml-3 flex-1">{error}</Text>
            </View>
          )}
          
          {saveSuccess && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text className="text-green-800 text-sm ml-3 flex-1">
                Privacy settings saved successfully!
              </Text>
            </View>
          )}
          
          <View>
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-800 text-sm ml-3 flex-1">
                  When your account is private, only your followers can see your posts. 
                  People must send a follow request which you can approve or deny.
                </Text>
              </View>
            </View>
            
            <View className="bg-white border border-gray-200 rounded-lg p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row items-start">
                  <Ionicons name="lock-closed" size={20} color="#3B82F6" />
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-medium text-gray-900">Private Account</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      Only approved followers can see your posts and activity
                    </Text>
                    
                    {settings.privateAccount && (
                      <View className="mt-3 bg-blue-50 rounded-lg p-3">
                        <View className="space-y-1">
                          <Text className="text-xs text-gray-600">• Your posts are only visible to your followers</Text>
                          <Text className="text-xs text-gray-600">• People must request to follow you</Text>
                          <Text className="text-xs text-gray-600">• Your profile won't appear in search results</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                
                <View className="ml-3">
                  <Switch
                    value={settings.privateAccount}
                    onValueChange={togglePrivateAccount}
                    trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSaveSettings}
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
                Save Privacy Settings
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default PrivacySettings;