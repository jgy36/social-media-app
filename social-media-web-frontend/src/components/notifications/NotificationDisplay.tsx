// src/components/notifications/NotificationDisplay.tsx
import React from 'react';
import { Notification } from '@/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, Heart, UserPlus, AtSign, Bell, Mail,
  Globe, MessageCircle, CheckCircle, XCircle 
} from 'lucide-react';

interface NotificationDisplayProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ 
  notification, 
  onClick 
}) => {
  // Format time since notification
  const timeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "a while ago";
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.notificationType) {
      case 'comment_created':
      case 'comment_reply':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'mention':
        return <AtSign className="h-5 w-5 text-purple-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'follow_request':
        return <UserPlus className="h-5 w-5 text-yellow-500" />;
      case 'follow_request_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'follow_request_rejected':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'direct_message':
        return <Mail className="h-5 w-5 text-indigo-500" />;
      case 'community_update':
        return <Globe className="h-5 w-5 text-teal-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div
      className="py-2 px-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative flex items-start gap-3"
      onClick={() => onClick(notification)}
    >
      <div className="mt-1 flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500"></div>
      )}
    </div>
  );
};

export default NotificationDisplay;