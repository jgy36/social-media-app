// src/components/profile/MessageButton.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare } from 'lucide-react';
import { Button, ButtonProps } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getOrCreateConversation } from '@/api/messages';

interface MessageButtonProps extends ButtonProps {
  username: string;
  userId?: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
}

const MessageButton = ({
  username,
  userId,
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
  ...props
}: MessageButtonProps) => {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);

  // Prevent messaging yourself
  const isSelf = currentUser.username === username || currentUser.id === userId;

  const handleClick = async () => {
    if (isSelf) return;
    
    setLoading(true);
    
    try {
      // Make sure we have the userId before proceeding
      if (!userId) {
        // If somehow we don't have the userId, fall back to username-based route
        router.push(`/messages/${username}`);
        return;
      }
      
      // Try to get or create a conversation first
      try {
        const { conversationId } = await getOrCreateConversation(userId);
        
        // If successful, redirect directly to the conversation
        router.push(`/messages/conversation/${conversationId}`);
        return;
      } catch (convError) {
        console.error("Error getting/creating conversation:", convError);
        // If that fails, just go to the direct message page
        router.push(`/messages/${userId}`);
      }
    } catch (error) {
      console.error("Error in message button:", error);
      // Fall back to user ID based route if any other error occurs
      router.push(`/messages/${userId}`);
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) {
    return null; // Don't show message button for own profile
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || isSelf}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {showIcon && <MessageSquare className="h-4 w-4 mr-2" />}
          <span>Message</span>
        </div>
      )}
    </Button>
  );
};

export default MessageButton;