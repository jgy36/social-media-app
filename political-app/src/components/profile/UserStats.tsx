/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/profile/UserStats.tsx
import { useState } from 'react';
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
        <span><strong>{postsCount}</strong> Posts</span>
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