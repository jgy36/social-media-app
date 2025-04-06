// In src/components/profile/UserStats.tsx
// Make sure the component is correctly receiving and displaying postsCount

import { useState, useEffect } from 'react';
import { MessagesSquare, Users, User as UserIcon } from 'lucide-react';
import FollowListModal from '@/components/profile/FollowListModal';

interface UserStatsProps {
  userId: number;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  className?: string;
  onFollowChange?: (newFollowersCount: number, newFollowingCount: number) => void;
}

const UserStats = ({ 
  userId, 
  postsCount, 
  followersCount, 
  followingCount,
  className = "",
  onFollowChange
}: UserStatsProps) => {
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);
  const [currentPostsCount, setCurrentPostsCount] = useState(postsCount);
  
  // Listen for post count updates from localStorage or events
  useEffect(() => {
    // Initialize from props
    setCurrentPostsCount(postsCount);
    
    // Also check localStorage for a potentially more up-to-date value
    const savedPostCount = localStorage.getItem('userPostsCount');
    if (savedPostCount) {
      setCurrentPostsCount(parseInt(savedPostCount, 10));
    }
    
    // Listen for updates
    const handlePostCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.count !== undefined) {
        setCurrentPostsCount(customEvent.detail.count);
      }
    };
    
    window.addEventListener('userPostsCountUpdated', handlePostCountUpdate);
    
    return () => {
      window.removeEventListener('userPostsCountUpdated', handlePostCountUpdate);
    };
  }, [postsCount]);
  
  // Update when props change
  useEffect(() => {
    setCurrentPostsCount(postsCount);
  }, [postsCount]);
  
  // Update counts when follows change within modal
  const handleFollowUpdate = (isFollowing: boolean, newFollowersCount: number, newFollowingCount: number) => {
    if (onFollowChange) {
      onFollowChange(newFollowersCount, newFollowingCount);
    }
  };
  
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* Posts Count */}
      <div className="flex items-center">
        <MessagesSquare className="h-4 w-4 mr-1 text-muted-foreground" />
        <span><strong>{currentPostsCount}</strong> Posts</span>
      </div>
      
      {/* Followers Count (Clickable) */}
      <div 
        className="flex items-center cursor-pointer hover:text-primary transition-colors"
        onClick={() => setActiveModal('followers')}
        role="button"
        aria-label="View followers"
      >
        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
        <span><strong>{followersCount}</strong> Followers</span>
      </div>
      
      {/* Following Count (Clickable) */}
      <div 
        className="flex items-center cursor-pointer hover:text-primary transition-colors"
        onClick={() => setActiveModal('following')}
        role="button"
        aria-label="View following"
      >
        <UserIcon className="h-4 w-4 mr-1 text-muted-foreground" />
        <span><strong>{followingCount}</strong> Following</span>
      </div>
      
      {/* Followers Modal */}
      <FollowListModal
        userId={userId}
        listType="followers"
        isOpen={activeModal === 'followers'}
        onClose={() => setActiveModal(null)}
        title={`Followers (${followersCount})`}
      />
      
      {/* Following Modal */}
      <FollowListModal
        userId={userId}
        listType="following"
        isOpen={activeModal === 'following'}
        onClose={() => setActiveModal(null)}
        title={`Following (${followingCount})`}
      />
    </div>
  );
};

export default UserStats;