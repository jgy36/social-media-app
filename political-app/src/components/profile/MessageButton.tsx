// src/components/profile/MessageButton.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { MessageSquare } from 'lucide-react';
import { Button, ButtonProps } from "@/components/ui/button";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
    
    // If we have userId, use that route
    if (userId) {
      router.push(`/messages/${userId}`);
    } else {
      // Otherwise use username
      router.push(`/messages/${username}`);
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