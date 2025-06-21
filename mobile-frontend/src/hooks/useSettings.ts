// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useToast } from '@/hooks/use-toast';
import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Import API services
import * as securityApi from '@/api/security';
import * as notificationPreferencesApi from '@/api/notificationPreferences';
import * as privacySettingsApi from '@/api/privacySettings';
import * as accountManagementApi from '@/api/accountManagement';

// Import Redux actions
import { 
  fetchNotificationPreferences, 
  updateNotificationPreferences,
  togglePreference
} from '@/redux/slices/notificationPreferencesSlice';

import {
  fetchPrivacySettings,
  updatePrivacySettings,
  toggleSetting
} from '@/redux/slices/privacySettingsSlice';

/**
 * Hook for working with security settings (2FA, password, sessions)
 */
export const useSecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAData, setTwoFAData] = useState<securityApi.TwoFASetupResponse | null>(null);
  const [sessions, setSessions] = useState<securityApi.UserSession[]>([]);
  
  const { toast } = useToast();
  
  // Fetch 2FA status
  const fetchTwoFAStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { enabled } = await securityApi.getTwoFAStatus();
      setTwoFAEnabled(enabled);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch 2FA status');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to fetch 2FA status');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch 2FA status',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Initialize 2FA setup
  const initTwoFASetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await securityApi.initTwoFASetup();
      setTwoFAData(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize 2FA setup');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to initialize 2FA setup');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to initialize 2FA setup',
          variant: 'destructive',
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Verify and enable 2FA
  const verifyAndEnableTwoFA = useCallback(async (code: string, secret: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await securityApi.verifyAndEnableTwoFA(code, secret);
      
      if (result.success) {
        setTwoFAEnabled(true);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Two-factor authentication has been enabled');
        } else {
          toast({
            title: 'Success',
            description: 'Two-factor authentication has been enabled',
          });
        }
      } else {
        setError(result.message || 'Failed to verify 2FA code');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to verify 2FA code');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to verify 2FA code',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to verify 2FA code');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to verify 2FA code');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to verify 2FA code',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Disable 2FA
  const disableTwoFA = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await securityApi.disableTwoFA();
      
      if (result.success) {
        setTwoFAEnabled(false);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Two-factor authentication has been disabled');
        } else {
          toast({
            title: 'Success',
            description: 'Two-factor authentication has been disabled',
          });
        }
      } else {
        setError(result.message || 'Failed to disable 2FA');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to disable 2FA');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to disable 2FA',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to disable 2FA');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to disable 2FA',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await securityApi.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Your password has been changed successfully');
        } else {
          toast({
            title: 'Success',
            description: 'Your password has been changed successfully',
          });
        }
      } else {
        setError(result.message || 'Failed to change password');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to change password');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to change password',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to change password');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to change password',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Fetch active sessions
  const fetchActiveSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await securityApi.getActiveSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active sessions');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to fetch active sessions');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch active sessions',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Sign out all devices
  const signOutAllDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await securityApi.signOutAllDevices();
      
      if (result.success) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'You have been signed out from all other devices');
        } else {
          toast({
            title: 'Success',
            description: 'You have been signed out from all other devices',
          });
        }
      } else {
        setError(result.message || 'Failed to sign out all devices');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to sign out all devices');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to sign out all devices',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to sign out all devices');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to sign out all devices');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to sign out all devices',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Initialize
  useEffect(() => {
    fetchTwoFAStatus();
    fetchActiveSessions();
  }, [fetchTwoFAStatus, fetchActiveSessions]);
  
  return {
    loading,
    error,
    twoFAEnabled,
    twoFAData,
    sessions,
    fetchTwoFAStatus,
    initTwoFASetup,
    verifyAndEnableTwoFA,
    disableTwoFA,
    changePassword,
    fetchActiveSessions,
    signOutAllDevices,
  };
};

/**
 * Hook for working with notification preferences
 */
export const useNotificationPreferences = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  // Get state from Redux
  const { preferences, isLoading, error } = useSelector(
    (state: RootState) => state.notificationPreferences
  );
  
  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      await dispatch(fetchNotificationPreferences()).unwrap();
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to fetch notification preferences');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch notification preferences',
          variant: 'destructive',
        });
      }
    }
  }, [dispatch, toast]);
  
  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: notificationPreferencesApi.NotificationPreferences) => {
    try {
      await dispatch(updateNotificationPreferences(newPreferences)).unwrap();
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Success', 'Notification preferences updated successfully');
      } else {
        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully',
        });
      }
      
      return true;
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to update notification preferences');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update notification preferences',
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [dispatch, toast]);
  
  // Toggle a single preference
  const togglePreferenceValue = useCallback(async (key: keyof notificationPreferencesApi.NotificationPreferences) => {
    try {
      dispatch(togglePreference({ key }));
      
      // Also update on server
      const result = await notificationPreferencesApi.toggleNotificationPreference(key);
      
      return true;
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || `Failed to toggle ${key} preference`);
      } else {
        toast({
          title: 'Error',
          description: err.message || `Failed to toggle ${key} preference`,
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [dispatch, toast]);
  
  // Initialize
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);
  
  return {
    preferences,
    loading: isLoading,
    error,
    fetchPreferences,
    updatePreferences,
    togglePreference: togglePreferenceValue,
  };
};

/**
 * Hook for working with privacy settings
 */
export const usePrivacySettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  // Get state from Redux
  const { settings, isLoading, error } = useSelector(
    (state: RootState) => state.privacySettings
  );
  
  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      await dispatch(fetchPrivacySettings()).unwrap();
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to fetch privacy settings');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to fetch privacy settings',
          variant: 'destructive',
        });
      }
    }
  }, [dispatch, toast]);
  
  // Update settings
  const updateSettings = useCallback(async (newSettings: privacySettingsApi.PrivacySettings) => {
    try {
      await dispatch(updatePrivacySettings(newSettings)).unwrap();
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Success', 'Privacy settings updated successfully');
      } else {
        toast({
          title: 'Success',
          description: 'Privacy settings updated successfully',
        });
      }
      
      return true;
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to update privacy settings');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to update privacy settings',
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [dispatch, toast]);
  
  // Toggle a single setting
  const toggleSettingValue = useCallback(async (key: keyof privacySettingsApi.PrivacySettings) => {
    try {
      dispatch(toggleSetting({ key }));
      
      // Also update on server
      const result = await privacySettingsApi.togglePrivacySetting(key);
      
      return true;
    } catch (err: any) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || `Failed to toggle ${key} setting`);
      } else {
        toast({
          title: 'Error',
          description: err.message || `Failed to toggle ${key} setting`,
          variant: 'destructive',
        });
      }
      return false;
    }
  }, [dispatch, toast]);
  
  // Initialize
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  return {
    settings,
    loading: isLoading,
    error,
    fetchSettings,
    updateSettings,
    toggleSetting: toggleSettingValue,
  };
};

/**
 * Hook for working with account management
 */
export const useAccountManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [connectedAccounts, setConnectedAccounts] = useState<accountManagementApi.ConnectedAccounts>({});
  
  const { toast } = useToast();
  
  // Check email verification status
  const checkEmailVerificationStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { isVerified, email } = await accountManagementApi.getEmailVerificationStatus();
      setEmailVerified(isVerified);
      setEmail(email);
    } catch (err: any) {
      setError(err.message || 'Failed to check email verification status');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountManagementApi.sendVerificationEmail();
      
      if (result.success) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Verification email sent successfully');
        } else {
          toast({
            title: 'Success',
            description: 'Verification email sent successfully',
          });
        }
      } else {
        setError(result.message || 'Failed to send verification email');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to send verification email');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to send verification email',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to send verification email');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to send verification email',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Verify email with code
  const verifyEmail = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountManagementApi.verifyEmail(code);
      
      if (result.success) {
        setEmailVerified(true);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Email verified successfully');
        } else {
          toast({
            title: 'Success',
            description: 'Email verified successfully',
          });
        }
      } else {
        setError(result.message || 'Failed to verify email');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to verify email');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to verify email',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to verify email');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to verify email',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Request email change
  const requestEmailChange = useCallback(async (newEmail: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountManagementApi.requestEmailChange(newEmail);
      
      if (result.success) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', 'Email change request sent successfully');
        } else {
          toast({
            title: 'Success',
            description: 'Email change request sent successfully',
          });
        }
      } else {
        setError(result.message || 'Failed to request email change');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to request email change');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to request email change',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to request email change');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to request email change');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to request email change',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Get connected accounts
  const fetchConnectedAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accounts = await accountManagementApi.getConnectedAccounts();
      setConnectedAccounts(accounts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch connected accounts');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Disconnect social account
  const disconnectSocialAccount = useCallback(async (provider: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountManagementApi.disconnectSocialAccount(provider);
      
      if (result.success) {
        // Update local state
        setConnectedAccounts(prev => ({
          ...prev,
          [provider]: false
        }));
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Success', `${provider} account disconnected successfully`);
        } else {
          toast({
            title: 'Success',
            description: `${provider} account disconnected successfully`,
          });
        }
      } else {
        setError(result.message || `Failed to disconnect ${provider} account`);
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || `Failed to disconnect ${provider} account`);
        } else {
          toast({
            title: 'Error',
            description: result.message || `Failed to disconnect ${provider} account`,
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || `Failed to disconnect ${provider} account`);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || `Failed to disconnect ${provider} account`);
      } else {
        toast({
          title: 'Error',
          description: err.message || `Failed to disconnect ${provider} account`,
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Export user data for React Native
const exportUserData = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await accountManagementApi.exportUserData();
    
    // Check if the operation was successful
    if (!result.success) {
      setError(result.message || 'Failed to export user data');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', result.message || 'Failed to export user data');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to export user data',
          variant: 'destructive',
        });
      }
      return false;
    }
    
    // If there's a filePath, read the file and share it
    if (result.filePath) {
      try {
        // Read the file
        const fileContent = await FileSystem.readAsStringAsync(result.filePath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Create a new file name in the documents directory
        const fileName = `politicalapp-data-${Date.now()}.zip`;
        const fileUri = FileSystem.documentDirectory + fileName;
        
        // Write to the documents directory
        await FileSystem.writeAsStringAsync(fileUri, fileContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/zip',
            dialogTitle: 'Export User Data',
          });
        } else {
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Alert.alert('Data Exported', `Your data has been saved to ${fileUri}`);
          } else {
            toast({
              title: 'Data Exported',
              description: `Your data has been saved to ${fileUri}`,
            });
          }
        }
        
        return true;
      } catch (fileError) {
        console.error('Error handling file:', fileError);
        setError('Failed to process exported data file');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', 'Failed to process exported data file');
        } else {
          toast({
            title: 'Error',
            description: 'Failed to process exported data file',
            variant: 'destructive',
          });
        }
        return false;
      }
    } else {
      // Handle case where no filePath is provided
      setError('No data file path received');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', 'No data file path received');
      } else {
        toast({
          title: 'Error',
          description: 'No data file path received',
          variant: 'destructive',
        });
      }
      return false;
    }
  } catch (err: any) {
    setError(err.message || 'Failed to export user data');
    
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert('Error', err.message || 'Failed to export user data');
    } else {
      toast({
        title: 'Error',
        description: err.message || 'Failed to export user data',
        variant: 'destructive',
      });
    }
    return false;
  } finally {
    setLoading(false);
  }
}, [toast]);
  
  // Delete user account
  const deleteUserAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await accountManagementApi.deleteUserAccount();
      
      if (result.success) {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Account Deleted', 'Your account has been permanently deleted');
        } else {
          toast({
            title: 'Account Deleted',
            description: 'Your account has been permanently deleted',
          });
        }
      } else {
        setError(result.message || 'Failed to delete account');
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          Alert.alert('Error', result.message || 'Failed to delete account');
        } else {
          toast({
            title: 'Error',
            description: result.message || 'Failed to delete account',
            variant: 'destructive',
          });
        }
      }
      
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Alert.alert('Error', err.message || 'Failed to delete account');
      } else {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete account',
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Initialize
  useEffect(() => {
    checkEmailVerificationStatus();
    fetchConnectedAccounts();
  }, [checkEmailVerificationStatus, fetchConnectedAccounts]);
  
  return {
    loading,
    error,
    emailVerified,
    email,
    connectedAccounts,
    checkEmailVerificationStatus,
    sendVerificationEmail,
    verifyEmail,
    requestEmailChange,
    fetchConnectedAccounts,
    disconnectSocialAccount,
    exportUserData,
    deleteUserAccount,
  };
};