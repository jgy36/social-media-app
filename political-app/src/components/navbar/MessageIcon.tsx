// src/components/navbar/MessageIcon.tsx
import React, { useState, useRef } from 'react';
import { MessageSquare, CircleDot } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/router';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const MessageIcon = () => {
  // In a real app, you would fetch these from an API
  const [messages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  // Navigate to messages page
  const goToMessages = () => {
    router.push('/messages');
    closePopover();
  };
  
  const closePopover = () => {
    if (popoverRef.current) {
      const popoverElement = popoverRef.current as unknown as { close?: () => void };
      if (popoverElement.close) {
        popoverElement.close();
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="View messages">
          <MessageSquare className="h-5 w-5 relative" />
          {unreadCount > 0 && (
            <CircleDot className="absolute top-1 right-1 h-2 w-2 text-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-4" ref={popoverRef}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Messages</h3>
          <Button variant="link" size="sm" onClick={goToMessages}>
            View All
          </Button>
        </div>
        
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map(message => (
              <div 
                key={message.id}
                className="py-2 px-1 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors relative"
                onClick={() => router.push(`/messages/${message.id}`)}
              >
                <div className="flex justify-between">
                  <p className="font-medium text-sm">{message.sender}</p>
                  <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                </div>
                <p className="text-sm truncate">{message.content}</p>
                {!message.isRead && (
                  <CircleDot className="absolute top-2 right-2 h-2 w-2 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MessageIcon;