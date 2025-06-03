// src/pages/messages/conversation/[id].tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Check, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMessages } from '@/hooks/useMessages';
import { formatRelative, format } from 'date-fns';
import { getProfileImageUrl } from '@/utils/imageUtils';
import { Message } from '@/api/messages';
import { getConversationMessages, getOrCreateConversation } from '@/api/messages';

const ConversationPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const conversationId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sentMessageIds, setSentMessageIds] = useState<{[key: number]: boolean}>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const user = useSelector((state: RootState) => state.user);
  
  const {
    messages,
    loading,
    error,
    activeConversation,
    conversations,
    fetchMessages,
    sendMessage,
    fetchConversations
  } = useMessages();

  // Find current conversation details
  const currentConversation = conversationId 
    ? conversations.find(conv => conv.id === conversationId) 
    : undefined;
  
  // Directly fetch messages when the component loads or refreshes
  // This ensures we always have messages even after a page refresh
  useEffect(() => {
    const loadConversationData = async () => {
      if (!conversationId) return;
      
      setInitialLoading(true);
      
      try {
        // First make sure we have the conversations loaded
        if (conversations.length === 0) {
          await fetchConversations();
        }
        
        // Then fetch messages for this specific conversation
        await fetchMessages(conversationId);
      } catch (err) {
        console.error("Error loading conversation:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadConversationData();
  }, [conversationId, fetchMessages, fetchConversations, conversations.length]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Manual refresh function
  const handleRefresh = async () => {
    if (!conversationId) return;
    
    setRefreshing(true);
    try {
      // Fetch both conversations and messages
      await fetchConversations();
      await fetchMessages(conversationId);
    } catch (err) {
      console.error("Error refreshing conversation:", err);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!conversationId || !newMessage.trim()) return;
    
    const sentMessage = await sendMessage(conversationId, newMessage);
    if (sentMessage) {
      // Track this message as one that YOU sent
      setSentMessageIds(prev => ({
        ...prev,
        [sentMessage.id]: true
      }));
      
      setNewMessage('');
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Check if a message was sent by the current user
  const isMessageFromCurrentUser = (message: Message): boolean => {
    // If we've tracked this as a message we sent, it's definitely ours
    if (sentMessageIds[message.id]) {
      return true;
    }
    
    // For new/untracked messages, we need to determine:
    // If we can identify the sender reliably, use that
    const senderId = message.sender?.id ? String(message.sender.id) : null;
    if (senderId && user.id && String(user.id) === senderId) {
      return true;
    }

    // Look at the message's "read" flag
    // Messages from other users are typically marked as read when you view them
    // Your own sent messages are never marked as read
    if (message.read !== undefined) {
      // If the message has been marked as read, it's likely from the other person
      return !message.read;
    }
    
    // We still can't determine - fallback to false (assume from other user)
    return false;
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);
  
  // Format timestamp for messages
  const formatMessageTime = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Unknown time";
    }
  };
  
  // Get the timestamp of the first message in a group for the header
  const getFirstMessageTimestamp = (messages: Message[]): string => {
    if (!messages || messages.length === 0) return '';
    
    // Sort messages by time
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Return formatted time of the first message
    try {
      const firstMessageTime = new Date(sortedMessages[0].createdAt);
      return formatRelative(firstMessageTime, new Date());
    } catch (error) {
      console.error("Error formatting first message time:", error);
      return formatRelative(new Date(), new Date()); // Fallback to current time
    }
  };
  
  // Check if we're in a loading state
  const isLoading = initialLoading || loading || refreshing;
  
  // Check if conversation exists and has messages
  const hasMessages = messages.length > 0;
  const hasConversationData = currentConversation !== undefined;
  
  return (
    <ProtectedRoute>
      <MainLayout section="messages">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <Card className="h-[75vh] flex flex-col">
            <CardHeader className="pb-3 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.push('/messages')}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  {hasConversationData && currentConversation?.otherUser ? (
                    <div className="flex items-center">
                      <Avatar className="h-9 w-9 mr-2">
                        <AvatarImage 
                          src={getProfileImageUrl(
                            currentConversation.otherUser.profileImageUrl || null, 
                            currentConversation.otherUser.username
                          )} 
                          alt={currentConversation.otherUser.username || 'User'}
                        />
                        <AvatarFallback>
                          {((currentConversation.otherUser.username || 'U')[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {currentConversation.otherUser.displayName || 
                           currentConversation.otherUser.username || 
                           'User'}
                        </CardTitle>
                        {currentConversation.isOnline && (
                          <p className="text-xs text-green-500">Online</p>
                        )}
                      </div>
                    </div>
                  ) : !isLoading ? (
                    <CardTitle className="text-lg">Conversation</CardTitle>
                  ) : (
                    <div className="h-9 flex items-center">
                      <div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  )}
                </div>
                
                {/* Refresh button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-y-auto py-4 px-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-8">
                  {error}
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => conversationId && fetchMessages(conversationId)}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : !hasMessages ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send a message to start the conversation
                  </p>
                  {!hasConversationData && (
                    <Button 
                      variant="outline" 
                      onClick={handleRefresh} 
                      className="mt-4"
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Reload conversation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex justify-center">
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          {getFirstMessageTimestamp(dayMessages)}
                        </div>
                      </div>
                      
                      {dayMessages.map((message) => {
                        // Use our method to determine if this is our message
                        const isMine = isMessageFromCurrentUser(message);
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Only show avatar for other user's messages */}
                            {!isMine && currentConversation?.otherUser && (
                              <Avatar className="h-8 w-8 mr-2 flex-shrink-0 mt-1">
                                <AvatarImage 
                                  src={getProfileImageUrl(
                                    currentConversation.otherUser.profileImageUrl || null, 
                                    currentConversation.otherUser.username || ''
                                  )} 
                                  alt={currentConversation.otherUser.username || 'User'}
                                />
                                <AvatarFallback>
                                  {((currentConversation.otherUser.username || '')[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div 
                              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                isMine 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <div className={`text-xs mt-1 flex items-center ${
                                isMine ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                <span>{formatMessageTime(message.createdAt)}</span>
                                
                                {/* Show read receipt only for my messages */}
                                {isMine && message.read && (
                                  <span className="ml-1 flex items-center">
                                    <Check className="h-3 w-3" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex-shrink-0 pt-3 pb-3 border-t gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || !conversationId || !hasConversationData}
                className="flex-grow"
                autoFocus
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !newMessage.trim() || !conversationId || !hasConversationData}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default ConversationPage;