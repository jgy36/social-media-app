import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser, getFollowStatus } from "@/api/users";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { FollowResponse } from '@/types/follow';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  isPrivateAccount?: boolean; // New prop for private accounts
  onFollowChange?: (isFollowing: boolean, followerCount: number, followingCount: number) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const FollowButton = ({ 
  userId, 
  initialIsFollowing = false, 
  isPrivateAccount = false, // Default to public account
  onFollowChange,
  size = 'default',
  variant = 'default'
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isRequested, setIsRequested] = useState(false); // New state for request status
  const [loading, setLoading] = useState(false);
  // Removed error state since it's unused
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
          setIsRequested(status.isRequested || false); // Check if follow is requested
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
  
  try {
    let response: FollowResponse;
    
    if (isFollowing) {
      response = await unfollowUser(userId);
      setIsRequested(false);
      setIsFollowing(false);
    } else {
      response = await followUser(userId);
      
      // Use the server response to determine the follow status
      // The server should return followStatus: "following" or "requested"
      console.log("Follow response:", response); // Debug log
      
      if (response.followStatus === "requested" || response.isRequested) {
        // Follow request was created (private account)
        setIsRequested(true);
        setIsFollowing(false);
      } else {
        // Direct follow was created (public account)
        setIsFollowing(true);
        setIsRequested(false);
      }
    }
    
    // Call the callback with updated data
    if (onFollowChange) {
      onFollowChange(
        response.isFollowing || false, 
        response.followersCount || 0, 
        response.followingCount || 0
      );
    }
  } catch (err) {
    console.error("Follow toggle error:", err);
  } finally {
    setLoading(false);
  }
};
  
  // Different button texts based on status
  let buttonText = "Follow";
  let buttonVariant = variant;
  
  if (isFollowing) {
    buttonText = "Following";
    buttonVariant = "outline";
  } else if (isRequested) {
    buttonText = "Requested";
    buttonVariant = "outline";
  } else if (isPrivateAccount) {
    buttonText = "Request to Follow";
  }
  
  // Define proper types for the variant to avoid using 'any'
  type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  return (
    <Button
      size={size}
      variant={buttonVariant as ButtonVariant}
      onClick={handleToggleFollow}
      disabled={loading || !initialized || userId === currentUserId || isRequested}
      className={isFollowing || isRequested 
        ? "border-primary/50 text-primary hover:text-destructive hover:border-destructive" 
        : ""}
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