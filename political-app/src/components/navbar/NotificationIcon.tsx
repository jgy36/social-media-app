// src/components/navbar/NotificationIcon.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/api/notifications';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useSelector((state: RootState) => state.user);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user.token) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Optional: Set up a polling interval to fetch notifications periodically
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    
    return () => clearInterval(interval); // Clean up on unmount
  }, [user.token]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Handle marking a notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        // Update the local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification status.");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  };

  // Format time since notification
  const timeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "a while ago";
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    if (open && unreadCount > 0) {
      // When popover opens, mark all as read automatically
      markAllAsRead();
    }
  };

  const closePopover = () => {
    // Programmatically close the Popover
    if (popoverRef.current) {
      // Cast to any to access the close method
      const popoverElement = popoverRef.current as unknown as { close?: () => void };
      if (popoverElement.close) {
        popoverElement.close();
      }
    }
  };

  // Parse username from notification for profile navigation
  const parseUsernameFromNotification = (message: string): string | null => {
    // Common patterns in notifications
    const repostPattern = /^(\w+) reposted your post/;
    const commentPattern = /^(\w+) commented on your post/;
    const likePattern = /^(\w+) liked your post/;
    const followPattern = /^(\w+) started following you/;
    
    // Try each pattern
    for (const pattern of [repostPattern, commentPattern, likePattern, followPattern]) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Handler to navigate based on notification content
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Try to extract information from the notification message
    const username = parseUsernameFromNotification(notification.message);
    
    if (username) {
      // If username found, navigate to their profile
      router.push(`/profile/${username}`);
    } else if (notification.message.includes("post")) {
      // Try to extract post ID - this requires a more specific pattern in your notifications
      // Example: "Someone commented on your post #123"
      const postIdMatch = notification.message.match(/post #(\d+)/);
      if (postIdMatch && postIdMatch[1]) {
        router.push(`/post/${postIdMatch[1]}`);
      }
    }
    
    // Close the popover regardless
    closePopover();
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="View notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 sm:w-96 p-4 overflow-y-auto max-h-[60vh]" 
        ref={popoverRef}
      >
        {isLoading ? (
          <p>Loading notifications...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="py-2 px-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative"
                onClick={() => handleNotificationClick(notification)}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeAgo(notification.createdAt)}
                </p>
                {!notification.read && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            ))}
          </div>
        )}
        {notifications.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationIcon;