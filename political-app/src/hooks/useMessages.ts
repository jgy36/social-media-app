// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import * as messagesApi from '@/api/messages';
import { Conversation, Message } from '@/api/messages';

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;

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
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await messagesApi.getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

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
    } catch (err) {
      console.error('Error starting conversation:', err);
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
    return message.sender.id === user.id;
  }, [user.id]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchConversations, fetchUnreadCount]);

  // Create polling effect for unread message count
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // Poll every minute

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