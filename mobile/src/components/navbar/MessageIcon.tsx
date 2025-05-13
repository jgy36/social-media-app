// src/components/navbar/MessageIcon.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { MessageSquare, X } from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useNavigation } from '@react-navigation/native';
import { 
  getUnreadMessagesCount, 
  getUserConversations, 
  getConversationMessages 
} from '@/api/messages';
import { Conversation, Message } from '@/api/messages';
import { formatDistanceToNow } from 'date-fns';

// Type to track both conversation and its messages
interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

const MessageIcon = () => {
  const [conversationsWithMessages, setConversationsWithMessages] = useState<ConversationWithMessages[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  
  // Get current user from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const currentUserId = useSelector((state: RootState) => state.user.id);
  
  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await getUnreadMessagesCount();
      console.log("Unread message count:", count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);
  
  // Fetch recent conversations and their messages
  const fetchRecentConversationsAndMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // First fetch all conversations
      const conversations = await getUserConversations();
      console.log("Fetched conversations:", conversations.length);
      
      // Filter out invalid conversations
      const validConversations = conversations.filter(conv => 
        conv && conv.otherUser && conv.otherUser.username
      );
      
      // Now fetch messages for each conversation
      const results = await Promise.all(
        validConversations.map(async (conversation) => {
          try {
            const messages = await getConversationMessages(conversation.id);
            return {
              conversation,
              messages: messages || []
            };
          } catch (err) {
            console.error(`Error fetching messages for conversation ${conversation.id}:`, err);
            return {
              conversation,
              messages: []
            };
          }
        })
      );
      
      console.log("Fetched conversations with messages:", results.length);
      setConversationsWithMessages(results);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Fetch on mount and set poll interval
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();
    
    // Poll every 30 seconds for new messages
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);
  
  // Navigate to messages page
  const goToMessages = () => {
    navigation.navigate('Messages');
    setModalVisible(false);
  };
  
  // Navigate to specific conversation
  const goToConversation = (conversationId: number) => {
    navigation.navigate('MessageConversation', { conversationId });
    setModalVisible(false);
  };

  // Load conversations when modal opens
  const handleModalOpen = () => {
    setModalVisible(true);
    console.log("Modal opened - fetching conversations and messages");
    fetchRecentConversationsAndMessages();
  };

  // Get messages from other users only, across all conversations, sorted by time (newest first)
  const allMessages = conversationsWithMessages
    .flatMap(cwm => 
      cwm.messages
        // Only include messages from other users (not sent by current user)
        .filter(msg => {
          // First check if sender exists
          if (!msg.sender) return false;
          
          // Convert IDs to strings for safer comparison
          const senderId = String(msg.sender.id);
          const myId = String(currentUserId);
          
          // Only include messages where sender is NOT current user
          return senderId !== myId;
        })
        .map(msg => ({
          ...msg,
          conversation: cwm.conversation
        }))
    )
    .sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  
  // Get the 6 most recent messages
  const recentMessages = allMessages.slice(0, 6);

  const renderMessage = ({ item }: { item: Message & { conversation: Conversation } }) => (
    <TouchableOpacity
      onPress={() => goToConversation(item.conversation.id)}
      className="p-3 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center mr-3">
          <Text className="text-white font-bold">
            {(item.conversation.otherUser.username || 'U')[0].toUpperCase()}
          </Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-center">
            <Text className="font-medium text-gray-900 dark:text-white">
              {item.conversation.otherUser.displayName || item.conversation.otherUser.username}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1" numberOfLines={1}>
            {item.content || 'No content'}
          </Text>
        </View>
        
        {!item.read && (
          <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity onPress={handleModalOpen} className="relative">
        <MessageSquare name="message-square" size={24} color="gray" />
        {unreadCount > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white dark:bg-gray-900">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Messages</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={goToMessages}>
                <Text className="text-blue-500">View All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X name="x" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
          
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-500 dark:text-gray-400 mt-2">Loading messages...</Text>
            </View>
          ) : recentMessages.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-gray-500 dark:text-gray-400 text-center">No messages from others yet.</Text>
              {isAuthenticated && (
                <TouchableOpacity 
                  onPress={fetchRecentConversationsAndMessages} 
                  className="mt-4 bg-blue-500 px-4 py-2 rounded-md"
                >
                  <Text className="text-white">Refresh Messages</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={recentMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default MessageIcon;