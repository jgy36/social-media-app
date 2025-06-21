// src/utils/createPersistedStorage.ts - React Native version
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a storage interface compatible with redux-persist
const createAsyncStorage = () => {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item in AsyncStorage:', error);
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from AsyncStorage:', error);
      }
    },
    getAllKeys: async (): Promise<string[]> => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        // Convert readonly string[] to mutable string[] for redux-persist compatibility
        return [...keys];
      } catch (error) {
        console.error('Error getting all keys from AsyncStorage:', error);
        return [];
      }
    },
    clear: async (): Promise<void> => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      }
    }
  };
};

// Export the storage instance for redux-persist
const storage = createAsyncStorage();

export default storage;