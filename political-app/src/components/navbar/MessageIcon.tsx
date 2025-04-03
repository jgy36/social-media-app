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
import { getUnreadMessagesCount, getUserConversations } from '@/api/messages';
import { Conversation } from '@/api/messages';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileImageUrl } from '@/utils/imageUtils';

const MessageIcon = () => {
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  
  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);
  
  // Fetch recent conversations
  const fetchRecentConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const conversations = await getUserConversations();
      console.log("Fetched conversations:", conversations); // Debug log
      setMessages(conversations.slice(0, 5)); // Show only 5 most recent
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
    
    // Poll every minute for new messages
    const intervalId = setInterval(() => {
      fetchUnreadCount();
      fetchRecentConversations(); // Also refresh conversations to get updated data
    }, 30000); // Every 30 seconds instead of 60
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount, fetchRecentConversations]);
  
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
    if (popoverRef.current) {
      const popoverElement = popoverRef.current as unknown as { close?: () => void };
      if (popoverElement.close) {
        popoverElement.close();
      }
    }
  };

  // Load conversations when popover opens
  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      fetchRecentConversations();
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
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
      <PopoverContent className="w-80 sm:w-96 p-4" ref={popoverRef}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Messages</h3>
          <Button variant="link" size="sm" onClick={goToMessages}>
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages
              .filter(conversation => conversation.otherUser != null)
              .map(conversation => (
                <div 
                  key={conversation.id}
                  className="py-2 px-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative"
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
                          {conversation.lastMessageTime 
                            ? formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })
                            : ''}
                        </p>
                      </div>
                      <p className="text-xs truncate text-muted-foreground">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  
                  {(conversation.unreadCount || 0) > 0 && (
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-medium">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MessageIcon;