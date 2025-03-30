/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/navbar/NotificationIcon.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Bell, CircleDot } from 'lucide-react';
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
import axios from 'axios';

// Notification Interface
interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
  recipient: {
    id: number;
    username: string;
  };
}

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useSelector((state: RootState) => state.user);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user.token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<Notification[]>(`${API_BASE_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        setNotifications(response.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user.token, API_BASE_URL]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Handle marking a notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Update the local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification status.");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
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

  // Handler to navigate based on notification (simplified for your data model)
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // You can add custom navigation logic based on notification content here
    // For now, just close the popover
    closePopover();
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="View notifications">
          <Bell className="h-5 w-5 relative" />
          {unreadCount > 0 && (
            <CircleDot className="absolute top-1 right-1 h-2 w-2 text-destructive" />
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
                  <CircleDot className="absolute top-2 right-2 h-2 w-2 text-blue-500" />
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