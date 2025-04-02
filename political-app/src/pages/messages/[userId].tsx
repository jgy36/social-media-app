// src/pages/messages/[userId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, User as UserIcon } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { getUserProfile } from '@/api/users';
import { UserProfile } from '@/api/types';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getProfileImageUrl } from '@/utils/imageUtils';
import { getOrCreateConversation, sendMessage } from '@/api/messages';

const DirectMessagePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const { startConversation } = useMessages();

  // Fetch user profile and check for existing conversation
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || typeof userId !== 'string') return;

      setLoading(true);
      try {
        // First try to convert userId to number
        const numericId = parseInt(userId);
        
        if (isNaN(numericId)) {
          // If not a number, assume it's a username
          const userProfile = await getUserProfile(userId);
          if (userProfile) {
            setUser(userProfile);
            
            // Try to get or create a conversation with this user
            if (userProfile.id) {
              try {
                const { conversationId } = await getOrCreateConversation(userProfile.id);
                setConversationId(conversationId);
                
                // If we have a conversation ID, redirect directly to the conversation
                if (conversationId) {
                  router.replace(`/messages/conversation/${conversationId}`);
                  return;
                }
              } catch (err) {
                console.error("Error getting/creating conversation:", err);
                // Silently continue without conversation ID - we'll create it when sending
              }
            }
          } else {
            // Don't show error to user, just log it
            console.error('User profile not found');
          }
        } else {
          // It's a numeric ID, try to get or create a conversation directly
          try {
            const { conversationId } = await getOrCreateConversation(numericId);
            setConversationId(conversationId);
            
            // We might not have user data yet, so let's fetch the user profile
            // This is a workaround until we update the API to return user data with conversation
            try {
              const userProfile = await getUserProfile(userId);
              if (userProfile) {
                setUser(userProfile);
              }
            } catch (profileErr) {
              console.error("Error fetching user profile:", profileErr);
              // Still continue even without profile data
            }
            
            // If we have a conversation ID, redirect directly to the conversation
            if (conversationId) {
              router.replace(`/messages/conversation/${conversationId}`);
              return;
            }
          } catch (err) {
            console.error("Error with conversation:", err);
            // Don't show error message to user, just log it
          }
        }
      } catch (err) {
        console.error('Error in user data fetch:', err);
        // Don't show error message to user, just log it
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!message.trim()) return; // Only require message, not user

    setSending(true);
    try {
      // If we already have a conversation ID, use it directly
      if (conversationId) {
        await sendMessage(conversationId, message);
        router.push(`/messages/conversation/${conversationId}`);
        return;
      }
      
      // If we have a user with ID, start conversation with that user
      if (user && user.id) {
        const result = await startConversation(user.id, message);
        if (result) {
          router.push(`/messages/conversation/${result.conversationId}`);
          return;
        }
      }
      
      // Last resort: If we have a numeric userId from the URL
      if (userId && !isNaN(Number(userId))) {
        const numericId = Number(userId);
        const result = await startConversation(numericId, message);
        if (result) {
          router.push(`/messages/conversation/${result.conversationId}`);
          return;
        }
      }
      
      // If we still can't send, just go back to messages
      console.error("Unable to send message - insufficient data");
      router.push('/messages');
    } catch (err) {
      console.error('Error sending message:', err);
      // Still try to navigate somewhere useful
      router.push('/messages');
    } finally {
      setSending(false);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && message.trim() && !sending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout section="messages">
        <div className="max-w-3xl mx-auto py-6 px-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/messages')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg">Message {user?.displayName || user?.username || 'User'}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="py-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : user ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={getProfileImageUrl(
                          user.profileImageUrl || null,
                          user.username
                        )}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{user.displayName || user.username}</h3>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message:</label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={6}
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>
                      <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-medium text-lg">New Message</h3>
                    <p className="text-muted-foreground">Type your message and click send</p>
                  </div>
                  <div className="space-y-2 w-full mt-4">
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={6}
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t">
              <div className="flex justify-end w-full">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => router.push('/messages')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending}
                >
                  {sending ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </div>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default DirectMessagePage;