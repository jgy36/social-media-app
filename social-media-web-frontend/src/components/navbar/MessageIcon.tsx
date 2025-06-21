// src/components/navbar/MessageIcon.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/router';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { 
  getUnreadMessagesCount, 
  getUserConversations, 
  getConversationMessages 
} from '@/api/messages';
import { Conversation, Message } from '@/api/messages';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl } from '@/utils/imageUtils';

// Type to track both conversation and its messages
interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

const MessageIcon = () => {
  const [conversationsWithMessages, setConversationsWithMessages] = useState<ConversationWithMessages[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
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
    router.push('/messages');
    closePopover();
  };
  
  // Navigate to specific conversation
  const goToConversation = (conversationId: number) => {
    router.push(`/messages/conversation/${conversationId}`);
    closePopover();
  };
  
  const closePopover = () => {
    setPopoverOpen(false);
    if (popoverRef.current) {
      const popoverElement = popoverRef.current as unknown as { close?: () => void };
      if (popoverElement.close) {
        popoverElement.close();
      }
    }
  };

  // Load conversations when popover opens
  const handlePopoverOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (open) {
      console.log("Popover opened - fetching conversations and messages");
      fetchRecentConversationsAndMessages();
    }
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
  
  // Get remaining messages
  const remainingMessages = allMessages.slice(6);

  return (
    <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="View messages" className="relative">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center p-[2px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-4 max-h-[400px] flex flex-col" ref={popoverRef}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="font-medium">Messages</h3>
          <Button variant="link" size="sm" onClick={goToMessages}>
            View All
          </Button>
        </div>
        
        <div className="overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading messages...</p>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No messages from others yet.</p>
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRecentConversationsAndMessages} 
                  className="mt-2"
                >
                  Refresh Messages
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Recent messages section */}
              {recentMessages.length > 0 && (
                <div className="space-y-1">
                  {recentMessages.map((message) => {
                    const conversation = message.conversation;
                    return (
                      <div 
                        key={message.id}
                        className="py-2 px-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative"
                        onClick={() => goToConversation(conversation.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage 
                              src={getProfileImageUrl(
                                conversation.otherUser.profileImageUrl || null,
                                conversation.otherUser.username
                              )}
                              alt={conversation.otherUser.username || 'User'}
                            />
                            <AvatarFallback>
                              {(conversation.otherUser.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="font-medium text-sm truncate">
                                {conversation.otherUser.displayName || conversation.otherUser.username}
                              </p>
                              <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-xs truncate text-muted-foreground">
                              {message.content || 'No content'}
                            </p>
                          </div>
                        </div>
                        
                        {!message.read && (
                          <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full w-2 h-2">
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Divider when both sections have content */}
              {recentMessages.length > 0 && remainingMessages.length > 0 && (
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-popover px-2 text-xs text-muted-foreground">
                      Earlier messages ({remainingMessages.length})
                    </span>
                  </div>
                </div>
              )}

              {/* Remaining messages */}
              {remainingMessages.length > 0 && (
                <div className="space-y-1">
                  {remainingMessages.map((message) => {
                    const conversation = message.conversation;
                    return (
                      <div 
                        key={message.id}
                        className="py-2 px-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative"
                        onClick={() => goToConversation(conversation.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage 
                              src={getProfileImageUrl(
                                conversation.otherUser.profileImageUrl || null,
                                conversation.otherUser.username
                              )}
                              alt={conversation.otherUser.username || 'User'}
                            />
                            <AvatarFallback>
                              {(conversation.otherUser.username || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="font-medium text-sm truncate">
                                {conversation.otherUser.displayName || conversation.otherUser.username}
                              </p>
                              <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-xs truncate text-muted-foreground">
                              {message.content || 'No content'}
                            </p>
                          </div>
                        </div>
                        
                        {!message.read && (
                          <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full w-2 h-2">
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MessageIcon;