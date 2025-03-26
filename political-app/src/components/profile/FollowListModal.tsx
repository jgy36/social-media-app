// src/components/profile/FollowListModal.tsx
import { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/router';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserFollowers, getUserFollowing } from "@/api/users";import FollowButton from '@/components/profile/FollowButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

// Create our own dialog components without the default close button

interface User {
  id: number;
  username: string;
  isFollowing: boolean;
}

interface FollowListModalProps {
  userId: number;
  listType: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// Custom dialog content without the default close button
const CustomDialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay 
      className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* No default close button here */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = "CustomDialogContent";

const FollowListModal = ({ 
  userId, 
  listType, 
  isOpen, 
  onClose, 
  title 
}: FollowListModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const currentUserId = useSelector((state: RootState) => state.user.id);
  
  // Load users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let userData: User[] = [];
        
        if (listType === 'followers') {
          userData = await getUserFollowers(userId, 1) as User[];
        } else {
          userData = await getUserFollowing(userId) as User[];
        }
        
        setUsers(userData);
      } catch (err) {
        console.error(`Error fetching ${listType}:`, err);
        setError(`Failed to load ${listType}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isOpen, userId, listType]);
  
  // Handle when someone is followed/unfollowed
  const handleFollowChange = (userId: number, isFollowing: boolean) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? {...user, isFollowing} : user
      )
    );
  };
  
  // Handle navigation to a user profile
  const navigateToProfile = (username: string) => {
    router.push(`/profile/${username}`);
    onClose();
  };
  
  // Generate modal title
  const modalTitle = title || `${listType === 'followers' ? 'Followers' : 'Following'}`;
  
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent className="max-w-md max-h-[80vh] bg-background border-border text-foreground">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{modalTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {listType === 'followers' 
                ? 'People who follow this account' 
                : 'People this account follows'}
            </p>
          </div>
          
          {/* Single custom close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <ScrollArea className="h-[50vh] pr-4 mt-4">
          {loading ? (
            // Loading skeletons
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-destructive mb-2">{error}</p>
              <button 
                onClick={() => setLoading(true)}
                className="text-sm text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">
                {listType === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            // User list - Improved styling for dark mode
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/50">
                  {/* User info (clickable) */}
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => navigateToProfile(user.username)}
                  >
                    <Avatar>
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                        alt={user.username} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{user.username}</p>
                    </div>
                  </div>
                  
                  {/* Follow button (if not viewing current user) */}
                  {user.id !== currentUserId && (
                    <FollowButton
                      userId={user.id}
                      initialIsFollowing={user.isFollowing}
                      size="sm"
                      onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CustomDialogContent>
    </DialogPrimitive.Root>
  );
};

export default FollowListModal;