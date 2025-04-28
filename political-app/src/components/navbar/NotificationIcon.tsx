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
import NotificationDisplay from '@/components/notifications/NotificationDisplay';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useSelector((state: RootState) => state.user);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Add near the top of the component, right after your state variables
  console.log("NotificationIcon - Redux user state:", user);
  console.log("NotificationIcon - Token from localStorage:", localStorage.getItem("token"));
  
  // Wrap the debug function in useCallback to prevent it from changing on every render
  const checkAuthState = React.useCallback(() => {
    const reduxToken = user.token;
    const localToken = localStorage.getItem("token");
    console.log("Auth check - Redux has token:", !!reduxToken);
    console.log("Auth check - localStorage has token:", !!localToken);
    if (localToken && !reduxToken) {
      console.warn("Token mismatch: localStorage has token but Redux doesn't!");
    }
  }, [user.token]);

  // Fetch notifications on component mount
  useEffect(() => {
    // Call checkAuthState at the beginning of the effect
    checkAuthState();
    
    const fetchNotifications = async () => {
      if (!user.token) {
        console.log("No user token available, skipping notification fetch");
        return;
      }

      console.log("Starting to fetch notifications...");
      setIsLoading(true);
      setError(null);

      try {
        console.log("Sending request to notifications endpoint");
        const data = await getNotifications();
        console.log("Notifications fetch result:", data.length > 0 ? `${data.length} notifications found` : "No notifications found");
        if (data.length > 0) {
          console.log("First notification:", data[0]);
        }
        setNotifications(data);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        // More detailed error logging
        if (err.response) {
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
        } else if (err.request) {
          console.error("No response received:", err.request);
        } else {
          console.error("Request setup error:", err.message);
        }
        setError("Failed to load notifications.");
      } finally {
        setIsLoading(false);
        console.log("Notification loading complete, isLoading set to false");
      }
    };

    fetchNotifications();

    // Optional: Set up a polling interval to fetch notifications periodically
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    console.log("Notification polling interval set up (60s)");
    
    return () => {
      console.log("Cleaning up notification polling interval");
      clearInterval(interval); // Clean up on unmount
    };
  }, [checkAuthState, user.token]);

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
    
    // Use notification type and reference IDs for navigation
    switch (notification.notificationType) {
      case 'comment_created':
        // Navigate to the post with the comment
        router.push(`/post/${notification.referenceId}`);
        break;
        
      case 'comment_reply':
        // Navigate to the post with focus on the comment
        router.push(`/post/${notification.referenceId}#comment-${notification.secondaryReferenceId}`);
        break;
        
      case 'mention':
        // Navigate to the post with the mention, possibly highlighting the comment
        if (notification.secondaryReferenceId) {
          // Mention in a comment
          router.push(`/post/${notification.referenceId}#comment-${notification.secondaryReferenceId}`);
        } else {
          // Mention in a post
          router.push(`/post/${notification.referenceId}`);
        }
        break;
        
      case 'like':
        // If secondary reference exists, it's a comment like
        if (notification.secondaryReferenceId) {
          router.push(`/post/${notification.referenceId}#comment-${notification.secondaryReferenceId}`);
        } else {
          // Post like
          router.push(`/post/${notification.referenceId}`);
        }
        break;
        
      case 'follow':
      case 'follow_request':
      case 'follow_request_approved':
      case 'follow_request_rejected':
        // Navigate to the profile of the user who triggered the action
        router.push(`/profile/${notification.referenceId}`);
        break;
        
      case 'direct_message':
        // Navigate to messages
        router.push(`/messages/${notification.referenceId}`);
        break;
        
      case 'community_update':
        // Navigate to community
        if (notification.communityId) {
          router.push(`/community/${notification.communityId}`);
        }
        break;
        
      default:
        // Fallback to existing message parsing logic
        const username = parseUsernameFromNotification(notification.message);
        if (username) {
          router.push(`/profile/${username}`);
        }
        break;
    }
    
    // Close the popover
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
              <NotificationDisplay
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
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