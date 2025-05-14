import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Share, Linking } from 'react-native';

import * as Clipboard from 'expo-clipboard';

interface ShareButtonProps {
  postId: number;
  sharesCount?: number;
}

const ShareButton = ({ postId, sharesCount = 0 }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    const postUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'https://yourapp.com'}/post/${postId}`;
    await Clipboard.setStringAsync(postUrl);
    
    // You might want to show a toast here
    console.log("Link copied to clipboard");
    
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    const postUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'https://yourapp.com'}/post/${postId}`;
    
    try {
      await Share.share({
        message: `Check out this post: ${postUrl}`,
        url: postUrl, // iOS only
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openTwitterShare = async () => {
    const postUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'https://yourapp.com'}/post/${postId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`;
    
    try {
      await Linking.openURL(twitterUrl);
      setIsOpen(false);
    } catch (error) {
      console.error('Error opening Twitter:', error);
    }
  };

  const openFacebookShare = async () => {
    const postUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'https://yourapp.com'}/post/${postId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    
    try {
      await Linking.openURL(facebookUrl);
      setIsOpen(false);
    } catch (error) {
      console.error('Error opening Facebook:', error);
    }
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        className="flex-row items-center"
      >
        <MaterialIcons name="share" size={20} color="#6366f1" />
        <Text className="ml-1 text-gray-600 dark:text-gray-400">
          {sharesCount > 0 ? sharesCount : "Share"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Post
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)} className="p-2">
                <MaterialIcons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Share this post with others
              </Text>
              
              <View className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Text className="text-sm text-gray-600 dark:text-gray-400" numberOfLines={1}>
                  {`${process.env.EXPO_PUBLIC_WEB_URL || 'https://yourapp.com'}/post/${postId}`}
                </Text>
              </View>
              
              {/* Share options */}
              <View className="space-y-3">
                <TouchableOpacity 
                  onPress={handleNativeShare}
                  className="flex-row items-center p-4 bg-blue-500 rounded-lg"
                >
                  <MaterialIcons name="share" size={20} color="white" />
                  <Text className="text-white font-semibold ml-3">Share using...</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleCopyLink}
                  className="flex-row items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <MaterialIcons name="content-copy" size={20} color="gray" />
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-3">Copy Link</Text>
                </TouchableOpacity>
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    onPress={openTwitterShare}
                    className="flex-1 p-4 border border-gray-300 dark:border-gray-700 rounded-lg items-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">Twitter</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={openFacebookShare}
                    className="flex-1 p-4 border border-gray-300 dark:border-gray-700 rounded-lg items-center"
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold">Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ShareButton;