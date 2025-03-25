/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/profile/FollowButton.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, getFollowStatus } from "@/api/users"; // Update import
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { FollowResponse } from '@/types/follow';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number, followingCount: number) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const FollowButton = ({ 
  userId, 
  initialIsFollowing = false, 
  onFollowChange,
  size = 'default',
  variant = 'default'
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const currentUserId = useSelector((state: RootState) => state.user.id);
  const router = useRouter();
  
  // Always fetch the real follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (isAuthenticated && userId !== currentUserId) {
          const status = await getFollowStatus(userId);
          setIsFollowing(status.isFollowing);
        }
        setInitialized(true);
      } catch (err) {
        console.error("Error checking follow status:", err);
        setInitialized(true);
      }
    };
    
    checkFollowStatus();
  }, [userId, isAuthenticated, currentUserId]);
  
  // Update if initialIsFollowing changes
  useEffect(() => {
    if (initialized) {
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing, initialized]);
  
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/profile/${userId}`)}`);
      return;
    }
    
    if (userId === currentUserId) {
      return; // Can't follow yourself
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response: FollowResponse;
      
      if (isFollowing) {
        response = await unfollowUser(userId);
      } else {
        response = await followUser(userId);
      }
      
      setIsFollowing(response.isFollowing);
      
      // Call the callback with updated data
      if (onFollowChange) {
        onFollowChange(
          response.isFollowing, 
          response.followersCount, 
          response.followingCount
        );
      }
    } catch (err) {
      setError("Failed to update follow status");
      console.error("Follow toggle error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const buttonText = isFollowing ? "Following" : "Follow";
  const buttonVariant = isFollowing ? "outline" : variant;
  
  return (
    <Button
      size={size}
      variant={buttonVariant as any}
      onClick={handleToggleFollow}
      disabled={loading || !initialized || userId === currentUserId}
      className={isFollowing ? "border-primary/50 text-primary hover:text-destructive hover:border-destructive" : ""}
      aria-label={buttonText}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default FollowButton;