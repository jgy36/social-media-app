// src/components/profile/ProfileHeader.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import SettingsDropdown from "./SettingsDropdown";
import UserStats from "./UserStats";
import { getFollowStatus } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";

const ProfileHeader = () => {
  const user = useSelector((state: RootState) => state.user);
  const token = useSelector((state: RootState) => state.user.token);
  const router = useRouter();

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  
  // State to store the image URL with cache-busting
  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(null);

  // Initial load of data including posts count
  useEffect(() => {
    if (user?.id && token) {
      setLoading(true);
      setError(null);

      const fetchStats = async () => {
        try {
          if (typeof user.id === "number") {
            const followStatus = await getFollowStatus(user.id);
            
            // Get post count from localStorage if available
            const savedPostCount = localStorage.getItem('userPostsCount');
            const postCount = savedPostCount ? parseInt(savedPostCount, 10) : 0;
            
            setStats({
              followersCount: followStatus.followersCount || 0,
              followingCount: followStatus.followingCount || 0,
              postCount: postCount, // Use saved post count or default to 0
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching follow stats:", error);
          setError("Failed to load profile stats");
          setLoading(false);
        }
      };

      fetchStats();
    }
  }, [user?.id, token]);

  // Listen for post count updates
  useEffect(() => {
    // Function to handle post count updates
    const handlePostCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.count !== undefined) {
        console.log("Posts count updated:", customEvent.detail.count);
        setStats(prevStats => ({
          ...prevStats,
          postCount: customEvent.detail.count
        }));
      }
    };

    // Add event listener for post count updates
    window.addEventListener('userPostsCountUpdated', handlePostCountUpdate);
    
    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('userPostsCountUpdated', handlePostCountUpdate);
    };
  }, []);

  // Initialize profile image on component mount
  useEffect(() => {
    if (user.profileImageUrl) {
      setProfileImageSrc(getProfileImageUrl(user.profileImageUrl, user.username));
    }
  }, [user.profileImageUrl, user.username]);

  // Handle profile image updates
  const handleProfileUpdate = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      console.log("ProfileHeader - Profile update event received:", customEvent.detail);
      
      // Get the image URL
      const imageUrl = String(customEvent.detail);
      console.log("Setting profile image to:", imageUrl);
      
      // Process the URL and add cache busting
      const processedUrl = getProfileImageUrl(imageUrl, user.username);
      setProfileImageSrc(processedUrl);
      
      // Also update the refresh key to force re-render
      setRefreshKey(Date.now());
    }
  }, [user.username]);

  // Listen for profile updates
  useEffect(() => {
    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileUpdate);
    };
  }, [handleProfileUpdate]);

  // Update image source when user profile changes in Redux
  useEffect(() => {
    if (user.profileImageUrl) {
      const newSrc = getProfileImageUrl(user.profileImageUrl, user.username);
      setProfileImageSrc(newSrc);
    }
  }, [user.profileImageUrl, user.username]);

  // Handle stats changes
  const handleStatsChange = (
    newFollowersCount: number,
    newFollowingCount: number
  ) => {
    setStats((prevStats) => ({
      ...prevStats,
      followersCount: newFollowersCount,
      followingCount: newFollowingCount,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage
            key={refreshKey} // Force re-render on refreshKey change
            src={profileImageSrc || getProfileImageUrl(user.profileImageUrl, user.username)}
            alt={user.username || "User"}
            onError={(e) => {
              console.error("Failed to load profile image:", e);
              
              // Try one more time with the image proxy directly
              if (user.profileImageUrl && !e.currentTarget.src.includes('dicebear')) {
                console.log("Retrying with direct proxy URL");
                e.currentTarget.src = getFullImageUrl(user.profileImageUrl);
              } else {
                // Fall back to the default avatar
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  user.username || "default"
                }`;
              }
            }}
          />
          <AvatarFallback>
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User Info */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-2xl font-bold">{user.displayName || "Guest"}</h2>
        <p className="text-muted-foreground">@{user.username || "unknown"}</p>

        {user.bio && <p className="mt-2">{user.bio}</p>}

        {/* User Stats - Now with clickable followers/following */}
        {user.id && (
          <UserStats
            userId={user.id}
            postsCount={stats.postCount}
            followersCount={stats.followersCount}
            followingCount={stats.followingCount}
            className="mt-3 justify-center md:justify-start"
            onFollowChange={handleStatsChange}
          />
        )}

        {/* Join date could go here if available */}
        <div className="flex items-center mt-2 justify-center md:justify-start">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span>Joined {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2">
        <SettingsDropdown />
      </div>
    </div>
  );
};

export default ProfileHeader;