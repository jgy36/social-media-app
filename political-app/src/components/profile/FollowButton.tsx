import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, getFollowStatus, checkAccountPrivacy } from "@/api/users";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { FollowResponse } from "@/types/follow";

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  isPrivateAccount?: boolean; // New prop for private accounts
  onFollowChange?: (
    isFollowing: boolean,
    followerCount: number,
    followingCount: number
  ) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const FollowButton = ({
  userId,
  initialIsFollowing = false,
  isPrivateAccount = false, // Default to public account
  onFollowChange,
  size = "default",
  variant = "default",
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [actuallyPrivate, setActuallyPrivate] = useState<boolean | null>(null);

  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const currentUserId = useSelector((state: RootState) => state.user.id);
  const router = useRouter();

  // Double-check privacy status directly
  const verifyPrivacyStatus = useCallback(async () => {
    console.log(`[FollowButton] 🔍 Verifying actual privacy status for user ID: ${userId}`);
    try {
      if (!isAuthenticated || userId === currentUserId) {
        return;
      }
      
      const privacyStatus = await checkAccountPrivacy(userId);
      console.log(`[FollowButton] 🔒 Direct privacy check result: ${privacyStatus}`);
      
      // Compare with the prop to detect inconsistencies
      if (privacyStatus !== isPrivateAccount) {
        console.warn(`[FollowButton] ⚠️ PRIVACY MISMATCH - Prop says ${isPrivateAccount ? 'private' : 'public'} but API says ${privacyStatus ? 'private' : 'public'}`);
      }
      
      setActuallyPrivate(privacyStatus);
    } catch (error) {
      console.error('[FollowButton] ❌ Error verifying privacy status:', error);
    }
  }, [userId, isAuthenticated, currentUserId, isPrivateAccount]);

  // Always fetch the real follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (isAuthenticated && userId !== currentUserId) {
          console.log(`[FollowButton] 🔄 Fetching follow status for user ID: ${userId}`);
          console.log(`[FollowButton] Prop says isPrivateAccount: ${isPrivateAccount}`);

          // First check direct privacy status
          await verifyPrivacyStatus();

          const status = await getFollowStatus(userId);
          console.log(`[FollowButton] 👤 Follow status response:`, status);

          setIsFollowing(status.isFollowing);
          setIsRequested(status.isRequested || false);
          
          console.log(`[FollowButton] Updated states - isFollowing: ${status.isFollowing}, isRequested: ${status.isRequested || false}`);
        }
        setInitialized(true);
      } catch (err) {
        console.error("[FollowButton] ❌ Error checking follow status:", err);
        setInitialized(true);
      }
    };

    console.log(`[FollowButton] Component mounted/updated for user ID: ${userId}`);
    checkFollowStatus();
  }, [userId, isAuthenticated, currentUserId, isPrivateAccount, verifyPrivacyStatus]);

  // Update if initialIsFollowing changes
  useEffect(() => {
    if (initialized && initialIsFollowing !== isFollowing) {
      console.log(`[FollowButton] initialIsFollowing prop changed from ${isFollowing} to ${initialIsFollowing}`);
      setIsFollowing(initialIsFollowing);
    }
  }, [initialIsFollowing, initialized, isFollowing]);
  
  // Notify other components when follow status changes
  const notifyFollowStatusChange = useCallback((newIsFollowing: boolean, newIsRequested: boolean) => {
    console.log(`[FollowButton] 📣 Dispatching followStatusChanged event - isFollowing: ${newIsFollowing}, isRequested: ${newIsRequested}`);
    
    window.dispatchEvent(new CustomEvent('followStatusChanged', { 
      detail: { 
        targetUserId: userId,
        isFollowing: newIsFollowing,
        isRequested: newIsRequested
      }
    }));
  }, [userId]);

  const handleToggleFollow = async () => {
    // Handle authentication required
    if (!isAuthenticated) {
      console.log(`[FollowButton] Not authenticated, redirecting to login`);
      router.push(
        `/login?redirect=${encodeURIComponent(`/profile/${userId}`)}`
      );
      return;
    }

    // Can't follow yourself
    if (userId === currentUserId) {
      console.log(`[FollowButton] Can't follow yourself`);
      return;
    }
    
    // Can't interact with button if already requested
    if (isRequested) {
      console.log(`[FollowButton] Already requested, button disabled`);
      return;
    }

    console.log(`[FollowButton] 🔄 Toggle follow initiated for user ID: ${userId}`);
    console.log(`[FollowButton] Current states - isFollowing: ${isFollowing}, isRequested: ${isRequested}`);
    
    // Get the most accurate privacy status (prop or verified)
    const targetIsPrivate = actuallyPrivate !== null ? actuallyPrivate : isPrivateAccount;
    console.log(`[FollowButton] Target account privacy status: ${targetIsPrivate ? 'PRIVATE' : 'PUBLIC'}`);
    
    setLoading(true);

    try {
      let response: FollowResponse;

      if (isFollowing) {
        console.log(`[FollowButton] Unfollowing user ID: ${userId}`);
        response = await unfollowUser(userId);
        console.log(`[FollowButton] Unfollow response:`, response);
        
        setIsRequested(false);
        setIsFollowing(false);
        
        // Notify other components
        notifyFollowStatusChange(false, false);
      } else {
        console.log(`[FollowButton] Following user ID: ${userId} (Private: ${targetIsPrivate})`);
        
        response = await followUser(userId);
        console.log(`[FollowButton] Follow response:`, JSON.stringify(response, null, 2));

        // Determine if it's a direct follow or a request based on response
        const isRequestCreated = response.followStatus === "requested" || response.isRequested;
        
        if (isRequestCreated) {
          console.log(`[FollowButton] ✉️ Follow request created - setting requested state`);
          setIsRequested(true);
          setIsFollowing(false);
        } else {
          console.log(`[FollowButton] ✅ Direct follow created - setting following state`);
          setIsFollowing(true);
          setIsRequested(false);
        }
        
        // Notify other components
        notifyFollowStatusChange(
          !isRequestCreated && (response.isFollowing || false), 
          isRequestCreated || false
        );
        
        // Log a warning if the response doesn't match the privacy expectations
        if (targetIsPrivate && !isRequestCreated) {
          console.warn(`[FollowButton] ⚠️ WARNING: Account is private but created direct follow instead of request!`);
        } else if (!targetIsPrivate && isRequestCreated) {
          console.warn(`[FollowButton] ⚠️ WARNING: Account is public but created request instead of direct follow!`);
        }
      }

      // Call the callback with updated data
      if (onFollowChange) {
        console.log(`[FollowButton] Calling onFollowChange callback with updated data`);
        onFollowChange(
          response.isFollowing || false,
          response.followersCount || 0,
          response.followingCount || 0
        );
      }
    } catch (err) {
      console.error("[FollowButton] ❌ Follow toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Different button texts based on status
  let buttonText = "Follow";
  let buttonVariant = variant;
  let buttonIcon: React.ReactNode = <UserPlus className="h-4 w-4 mr-1" />;

  if (isFollowing) {
    buttonText = "Following";
    buttonVariant = "outline";
    buttonIcon = <UserCheck className="h-4 w-4 mr-1" />;
  } else if (isRequested) {
    buttonText = "Requested";
    buttonVariant = "outline";
    buttonIcon = null;
  } else if (actuallyPrivate || isPrivateAccount) {
    buttonText = "Request to Follow";
  }

  // Log render info
  console.log(`[FollowButton] Rendering for user ID: ${userId} - Text: "${buttonText}", isFollowing: ${isFollowing}, isRequested: ${isRequested}`);

  // Define proper types for the variant to avoid using 'any'
  type ButtonVariant =
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

  return (
    <Button
      size={size}
      variant={buttonVariant as ButtonVariant}
      onClick={handleToggleFollow}
      disabled={
        loading || !initialized || userId === currentUserId || isRequested
      }
      className={
        isFollowing || isRequested
          ? "border-primary/50 text-primary hover:text-destructive hover:border-destructive"
          : ""
      }
      aria-label={buttonText}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {buttonIcon}
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default FollowButton;