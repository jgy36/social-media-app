// src/components/messages/MessageNotificationIndicator.tsx
import { useEffect, useState, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { getUnreadMessagesCount } from '@/api/messages';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface MessageNotificationIndicatorProps {
  className?: string;
  showCount?: boolean;
}

const MessageNotificationIndicator = ({ 
  className,
  showCount = true,
}: MessageNotificationIndicatorProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  // Fetch unread message count - wrapped in useCallback to prevent dependency changes
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const count = await getUnreadMessagesCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
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
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  // Don't show anything if not authenticated or no unread messages
  if (!isAuthenticated || unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className || ''}`}>
      <MessageSquare className="h-6 w-6" />
      {isAuthenticated && showCount && !loading && unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center p-[2px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};

export default MessageNotificationIndicator;