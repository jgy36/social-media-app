// src/pages/messages/new.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Search, Send, X } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { getProfileImageUrl } from '@/utils/imageUtils';
import { searchUsers } from '@/api/users';
import { UserProfile } from '@/api/types';
import { Textarea } from '@/components/ui/textarea';

const NewMessagePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startConversation } = useMessages();

  // Handle search
  useEffect(() => {
    const performUserSearch = async (searchTerm: string) => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      setError(null);
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users');
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(() => {
      performUserSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle selecting a user
  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchTerm('');
  };

  // Clear selected user
  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchTerm('');
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    setSending(true);
    setError(null);
    try {
      const result = await startConversation(selectedUser.id, message);
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
                <CardTitle className="text-lg">New Message</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">To:</label>
                  <div className="flex items-center space-x-2">
                    {selectedUser ? (
                      <div className="flex items-center gap-2 bg-accent px-3 py-2 rounded">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={getProfileImageUrl(
                              selectedUser.profileImageUrl || null,
                              selectedUser.username
                            )}
                            alt={selectedUser.username}
                          />
                          <AvatarFallback>
                            {selectedUser.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {selectedUser.displayName || selectedUser.username}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1"
                          onClick={handleClearUser}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search for a user..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Search results */}
                  {!selectedUser && searchResults.length > 0 && (
                    <div className="border rounded-md shadow-sm max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleSelectUser(user)}
                        >
                          <Avatar className="h-8 w-8">
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
                            <p className="font-medium">{user.displayName || user.username}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searching && (
                    <div className="text-center text-sm text-muted-foreground">
                      Searching users...
                    </div>
                  )}

                  {searchTerm && !searching && searchResults.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      No users found. Try a different search term.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message:</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    disabled={!selectedUser}
                  />
                </div>

                {error && (
                  <div className="text-destructive text-sm">
                    {error}
                  </div>
                )}
              </div>
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
                  disabled={!selectedUser || !message.trim() || sending}
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

export default NewMessagePage;