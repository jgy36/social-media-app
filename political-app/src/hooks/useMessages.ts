// src/hooks/useMessages.ts - Improved notification handling
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import * as messagesApi from '@/api/messages';
import { Conversation, Message } from '@/api/messages';
import { useToast } from '@/hooks/use-toast'; // Import toast for notifications

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastUnreadCount, setLastUnreadCount] = useState<number>(0);

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  const { toast } = useToast(); // Access toast for notifications

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await messagesApi.getUserConversations();
      setConversations(data);
      
      // Calculate total unread messages
      const totalUnread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      
      // Check if unread count has increased since last check
      if (totalUnread > lastUnreadCount) {
        // Find the conversations with new messages
        const convsWithNewMessages = data.filter(conv => 
          conv.unreadCount && conv.unreadCount > 0 && conv.lastMessage
        );
        
        // Show notification for each conversation with new messages
        // Limited to most recent to avoid notification spam
        if (convsWithNewMessages.length > 0) {
          const recentConv = convsWithNewMessages[0]; // Just show one notification
          toast({
            title: `New message from ${recentConv.otherUser?.displayName || recentConv.otherUser?.username || 'User'}`,
            description: recentConv.lastMessage?.length > 30 
              ? `${recentConv.lastMessage.substring(0, 30)}...` 
              : recentConv.lastMessage,
            duration: 5000
          });
        }
      }
      
      // Update unread count and remember last count
      setUnreadCount(totalUnread);
      setLastUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, lastUnreadCount, toast]);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await messagesApi.getUnreadMessagesCount();
      
      // If the count increased, fetch conversations to show notifications
      if (count > lastUnreadCount) {
        fetchConversations();
      } else {
        // Just update the count if no new messages
        setUnreadCount(count);
        setLastUnreadCount(count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated, lastUnreadCount, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const data = await messagesApi.getConversationMessages(conversationId);
      setMessages(data);
      setActiveConversation(conversationId);
      
      // Mark as read
      await messagesApi.markConversationAsRead(conversationId);
      
      // Update the conversation's unread count in the list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    if (!isAuthenticated || !content.trim()) return null;

    setError(null);
    try {
      const message = await messagesApi.sendMessage(conversationId, content);
      
      // Add the new message to the list
      setMessages(prev => [...prev, message]);
      
      // Update the conversation in the list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                lastMessage: content,
                lastMessageTime: new Date().toISOString()
              } 
            : conv
        )
      );
      
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  }, [isAuthenticated]);

  // Start a new conversation
  const startConversation = useCallback(async (userId: number, initialMessage: string) => {
    if (!isAuthenticated || !initialMessage.trim()) return null;

    setLoading(true);
    setError(null);
    try {
      // First get or create a conversation
      const { conversationId } = await messagesApi.getOrCreateConversation(userId);
      
      // Then send the initial message
      const message = await messagesApi.sendMessage(conversationId, initialMessage);
      
      // Refresh conversations
      await fetchConversations();
      
      // Set this as the active conversation and load messages
      await fetchMessages(conversationId);
      
      return { conversationId, message };
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchConversations, fetchMessages]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: number) => {
    if (!isAuthenticated) return;

    try {
      await messagesApi.markConversationAsRead(conversationId);
      
      // Update conversation in the list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Check if currently logged-in user is the sender of a message
  const isCurrentUserSender = useCallback((message: Message): boolean => {
    // Handle the case where user is null
    if (!user || user.id === null || !message.sender) {
      return false; // Default to false if we don't have user data
    }
    
    // Compare user IDs to determine if the current user is the sender
    return message.sender.id === user.id;
  }, [user]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchConversations, fetchUnreadCount]);

  // Create polling effect for unread message count - more frequent polling
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 15000); // Poll every 15 seconds instead of 60 for more responsive notifications

    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    error,
    unreadCount,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    markAsRead,
    isCurrentUserSender,
  };
};