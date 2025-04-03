// src/pages/messages/conversation/[id].tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMessages } from '@/hooks/useMessages';
import { formatRelative, format } from 'date-fns';
import { getProfileImageUrl } from '@/utils/imageUtils';

const ConversationPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const conversationId = typeof id === 'string' ? parseInt(id) : undefined;
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const user = useSelector((state: RootState) => state.user);
  
  const {
    messages,
    loading,
    error,
    activeConversation,
    conversations,
    fetchMessages,
    sendMessage,
    isCurrentUserSender,
  } = useMessages();

  // Debug user and message data
  useEffect(() => {
    console.log("Current user from Redux:", user);
    if (messages.length > 0) {
      console.log("Sample message:", messages[0]);
    }
  }, [user, messages]);
  
  // Find current conversation details
  const currentConversation = conversationId 
    ? conversations.find(conv => conv.id === conversationId) 
    : undefined;
  
  // Load messages when conversation ID changes
  useEffect(() => {
    if (conversationId && conversationId !== activeConversation) {
      fetchMessages(conversationId);
    }
  }, [conversationId, activeConversation, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!conversationId || !newMessage.trim()) return;
    
    const success = await sendMessage(conversationId, newMessage);
    if (success) {
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
  
  return (
    <ProtectedRoute>
      <MainLayout section="messages">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <Card className="h-[75vh] flex flex-col">
            <CardHeader className="pb-3 border-b flex-shrink-0">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/messages')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                {currentConversation?.otherUser ? (
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
                    <CardTitle className="text-lg">
                      {currentConversation.otherUser.displayName || 
                       currentConversation.otherUser.username || 
                       'User'}
                    </CardTitle>
                  </div>
                ) : (
                  <CardTitle className="text-lg">Conversation</CardTitle>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow overflow-y-auto py-4 px-3">
              {loading ? (
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
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex justify-center">
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          {formatRelative(new Date(date), new Date())}
                        </div>
                      </div>
                      
                      {dayMessages.map((message) => {
                        // Direct ID comparison - convert both to strings for reliable comparison
                        const myUserId = String(user.id);
                        const senderId = String(message.sender?.id || '');
                        
                        // Determine if message is from current user
                        const isMyMessage = myUserId === senderId;
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Only show avatar for other user's messages */}
                            {!isMyMessage && message.sender && (
                              <Avatar className="h-8 w-8 mr-2 flex-shrink-0 mt-1">
                                <AvatarImage 
                                  src={getProfileImageUrl(
                                    message.sender.profileImageUrl || null, 
                                    message.sender.username || ''
                                  )} 
                                  alt={message.sender.username || 'User'}
                                />
                                <AvatarFallback>
                                  {((message.sender.username || '')[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div 
                              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                isMyMessage 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <div className={`text-xs mt-1 ${
                                isMyMessage ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {formatMessageTime(message.createdAt)}
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
                disabled={loading || !conversationId}
                className="flex-grow"
                autoFocus
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={loading || !newMessage.trim() || !conversationId}
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