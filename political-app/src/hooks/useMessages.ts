// src/hooks/useMessages.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import * as messagesApi from '@/api/messages';
import { Conversation, Message } from '@/api/messages';
import { useToast } from '@/hooks/use-toast';

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [lastUnreadCount, setLastUnreadCount] = useState<number>(0);
  
  // Ref to track if initial fetch has happened
  const initialFetchDone = useRef<boolean>(false);
  // Ref to track retry attempts
  const retryCount = useRef<number>(0);
  // Ref to track if component is mounted
  const isMounted = useRef<boolean>(true);

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const { toast } = useToast();

  // Reset mounted state on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isMounted.current) return;
    
    // Don't check isAuthenticated here - we'll handle retries if it fails
    
    setLoading(true);
    setError(null);
    try {
      const data = await messagesApi.getUserConversations();
      if (isMounted.current) {
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
          if (convsWithNewMessages.length > 0) {
            const recentConv = convsWithNewMessages[0]; // Just show one notification
            toast({
              title: `New message from ${recentConv.otherUser?.displayName || recentConv.otherUser?.username || 'User'}`,
              description: recentConv.lastMessage && recentConv.lastMessage.length > 30 
                ? `${recentConv.lastMessage.substring(0, 30)}...` 
                : recentConv.lastMessage,
              duration: 5000
            });
          }
        }
        
        // Update unread count and remember last count
        setUnreadCount(totalUnread);
        setLastUnreadCount(totalUnread);
        
        // Mark as fetched successfully
        initialFetchDone.current = true;
        retryCount.current = 0;
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      if (isMounted.current) {
        setError('Failed to load conversations');
        
        // If we haven't made too many retry attempts, schedule another attempt
        if (retryCount.current < 3) {
          retryCount.current += 1;
          console.log(`Scheduling retry attempt ${retryCount.current} for conversations`);
          setTimeout(() => {
            if (isMounted.current) {
              fetchConversations();
            }
          }, 1500 * retryCount.current); // Increasing delay for each retry
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [lastUnreadCount, toast]);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const count = await messagesApi.getUnreadMessagesCount();
      
      if (isMounted.current) {
        // If the count increased, fetch conversations to show notifications
        if (count > lastUnreadCount) {
          fetchConversations();
        } else {
          // Just update the count if no new messages
          setUnreadCount(count);
          setLastUnreadCount(count);
        }
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [lastUnreadCount, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await messagesApi.getConversationMessages(conversationId);
      if (isMounted.current) {
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
      }
    } catch (err) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, err);
      if (isMounted.current) {
        setError('Failed to load messages');
        
        // If we haven't made too many retry attempts, schedule another attempt
        if (retryCount.current < 3) {
          retryCount.current += 1;
          console.log(`Scheduling retry attempt ${retryCount.current} for messages`);
          setTimeout(() => {
            if (isMounted.current) {
              fetchMessages(conversationId);
            }
          }, 1500 * retryCount.current); // Increasing delay for each retry
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchUnreadCount]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    if (!isMounted.current || !content.trim()) return null;

    setError(null);
    try {
      const message = await messagesApi.sendMessage(conversationId, content);
      
      if (isMounted.current) {
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
      }
      
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      if (isMounted.current) {
        setError('Failed to send message');
      }
      return null;
    }
  }, []);

  // Start a new conversation
  const startConversation = useCallback(async (userId: number, initialMessage: string) => {
    if (!isMounted.current || !initialMessage.trim()) return null;

    setLoading(true);
    setError(null);
    try {
      // First get or create a conversation
      const { conversationId } = await messagesApi.getOrCreateConversation(userId);
      
      if (!isMounted.current) return null;
      
      // Then send the initial message
      const message = await messagesApi.sendMessage(conversationId, initialMessage);
      
      if (!isMounted.current) return null;
      
      // Refresh conversations
      await fetchConversations();
      
      if (!isMounted.current) return null;
      
      // Set this as the active conversation and load messages
      await fetchMessages(conversationId);
      
      return { conversationId, message };
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      if (isMounted.current) {
        setError('Failed to start conversation');
      }
      return null;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [fetchConversations, fetchMessages]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId: number) => {
    if (!isMounted.current) return;

    try {
      await messagesApi.markConversationAsRead(conversationId);
      
      if (isMounted.current) {
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
      }
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, [fetchUnreadCount]);

  // Check if currently logged-in user is the sender of a message
  const isCurrentUserSender = useCallback((message: Message): boolean => {
    // Handle the case where user data is incomplete
    if (!user || !user.id || !message.sender || !message.sender.id) {
      return false;
    }
    
    // Convert both to strings for more reliable comparison
    const senderId = String(message.sender.id);
    const userId = String(user.id);
    
    return senderId === userId;
  }, [user]);

  // IMPROVED INITIAL LOAD EFFECT
  // This effect handles the initial data loading with better auth handling
  useEffect(() => {
    if (!isMounted.current) return;
    
    const loadInitialData = async () => {
      // Check if we need to load data
      if (!initialFetchDone.current) {
        console.log('Initial message data load');
        await fetchConversations();
      }
    };
    
    // If authenticated or auth state changes, try loading
    if (isAuthenticated) {
      loadInitialData();
    } else if (!initialFetchDone.current) {
      // If not authenticated but we haven't loaded yet, 
      // schedule a retry to catch when auth is restored
      const retryTimer = setTimeout(() => {
        if (isMounted.current && !initialFetchDone.current) {
          console.log('Retrying message data load');
          loadInitialData();
        }
      }, 1500);
      
      return () => clearTimeout(retryTimer);
    }
  }, [isAuthenticated, fetchConversations]);

  // IMPROVED POLLING EFFECT
  // Create polling effect for unread message count - more frequent polling
  useEffect(() => {
    if (!isMounted.current) return;
    
    // Only start polling when authenticated
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      if (isMounted.current) {
        fetchUnreadCount();
      }
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