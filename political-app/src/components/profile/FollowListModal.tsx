// src/components/profile/FollowListModal.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserFollowers, getUserFollowing } from '@/utils/api';
import FollowButton from '@/components/profile/FollowButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            {listType === 'followers' 
              ? 'People who follow this account' 
              : 'People this account follows'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[50vh] pr-4">
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
            // User list
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between gap-3">
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
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.username}</p>
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
      </DialogContent>
    </Dialog>
  );
};

export default FollowListModal;