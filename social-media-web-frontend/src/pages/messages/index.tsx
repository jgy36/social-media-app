// src/pages/messages/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Search, Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { getProfileImageUrl } from '@/utils/imageUtils';

const MessagesPage = () => {
  const router = useRouter();
  const {
    conversations,
    loading,
    error,
    unreadCount,
    fetchConversations,
  } = useMessages();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = searchTerm
    ? conversations.filter(
        conv => 
          conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (conv.otherUser.displayName && 
           conv.otherUser.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : conversations;
  
  // Navigate to conversation
  const handleOpenConversation = (conversationId: number) => {
    router.push(`/messages/conversation/${conversationId}`);
  };

  return (
    <ProtectedRoute>
      <MainLayout section="messages">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="flex items-center">
              {unreadCount > 0 && (
                <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs mr-2">
                  {unreadCount} unread
                </div>
              )}
              <Button onClick={() => router.push('/messages/new')} size="sm">
                New Message
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="conversations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="requests">Message Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversations" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center text-destructive py-8">
                      {error}
                      <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={() => fetchConversations()}>
                          Try Again
                        </Button>
                      </div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start a conversation with someone
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => router.push('/messages/new')}
                      >
                        New Message
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <div 
                          key={conversation.id} 
                          className={`flex items-center space-x-4 p-3 rounded-md hover:bg-accent cursor-pointer ${
                            conversation.unreadCount > 0 ? 'bg-accent/50' : ''
                          }`}
                          onClick={() => handleOpenConversation(conversation.id)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={getProfileImageUrl(
                                conversation.otherUser.profileImageUrl, 
                                conversation.otherUser.username
                              )} 
                              alt={conversation.otherUser.username}
                            />
                            <AvatarFallback>
                              {conversation.otherUser.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-baseline">
                              <h3 className={`font-medium truncate ${
                                conversation.unreadCount > 0 ? 'font-semibold' : ''
                              }`}>
                                {conversation.otherUser.displayName || conversation.otherUser.username}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessageTime ? 
                                  formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true }) :
                                  ''
                                }
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                            }`}>
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          
                          {conversation.unreadCount > 0 && (
                            <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requests">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No message requests</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    When someone you don&apos;t follow sends you a message, it will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default MessagesPage;