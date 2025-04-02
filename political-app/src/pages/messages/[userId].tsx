// src/pages/messages/[userId].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { getUserProfile } from '@/api/users';
import { UserProfile } from '@/api/types';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getProfileImageUrl } from '@/utils/imageUtils';

const DirectMessagePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startConversation } = useMessages();

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || typeof userId !== 'string') return;

      setLoading(true);
      setError(null);
      try {
        // First try to convert userId to number
        const numericId = parseInt(userId);
        
        if (isNaN(numericId)) {
          // If not a number, assume it's a username
          const userProfile = await getUserProfile(userId);
          if (userProfile) {
            setUser(userProfile);
          } else {
            setError('User not found');
          }
        } else {
          // TODO: Implement getUserById if your API supports it
          // For now, redirect to the new message page
          router.push('/messages/new');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, router]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!user || !message.trim()) return;

    setSending(true);
    setError(null);
    try {
      const result = await startConversation(user.id, message);
      if (result) {
        router.push(`/messages/conversation/${result.conversationId}`);
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setSending(false);
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-8">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push('/messages/new')}
                  >
                    Start a New Conversation
                  </Button>
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
                      rows={6}
                    />
                  </div>

                  {error && (
                    <div className="text-destructive text-sm">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  User not found
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
                  disabled={!user || !message.trim() || sending}
                >
                  {sending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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