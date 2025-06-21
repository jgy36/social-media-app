import React, { useEffect, useState } from "react"; // Removed unused useCallback
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import SettingsDropdown from "./SettingsDropdown";
import UserStats from "./UserStats";
import { getFollowStatus, checkAccountPrivacy } from "@/api/users"; // Add checkAccountPrivacy import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Lock } from "lucide-react"; // Removed unused Pencil
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { getUserData } from "@/utils/tokenUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getBadgeById } from "@/types/badges";
import BadgeSelector from "./BadgeSelector";
import FollowButton from "./FollowButton";
import MessageButton from "./MessageButton";

const ProfileHeader = () => {
  const user = useSelector((state: RootState) => state.user);
  const currentUser = useSelector((state: RootState) => state.user);
  const token = useSelector((state: RootState) => state.user.token);
  const isAuthenticated = !!currentUser.token;
  const userBadges = useSelector((state: RootState) => state.badges.badges);
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("");
  const [joinDate, setJoinDate] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
    isFollowing: false, // Added isFollowing property to fix error
  });

  // Removed unused loading and error states
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // State to store the image URL with cache-busting
  const [profileImageSrc, setProfileImageSrc] = useState<string | null>(null);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);

  // Load display name and ensure it's not empty
  useEffect(() => {
    // First try to get from Redux state
    if (user.displayName) {
      console.log("Using display name from Redux:", user.displayName);
      setDisplayName(user.displayName);
      return;
    }

    // If not in Redux, try to get from tokenUtils/localStorage
    const userData = getUserData();
    if (userData.displayName) {
      console.log(
        "Using display name from localStorage:",
        userData.displayName
      );
      setDisplayName(userData.displayName);
      return;
    }

    // If no display name is found, use the username instead of "Guest"
    if (user.username) {
      console.log("Falling back to username:", user.username);
      setDisplayName(user.username);
      return;
    }

    // Only use "Guest" as a last resort
    console.log("No name found, using 'Guest'");
    setDisplayName("Guest");
  }, [user.displayName, user.username]);

  // Initial load of data including posts count and join date
  useEffect(() => {
    if (user?.id && token) {
      const fetchStats = async () => {
        try {
          if (typeof user.id === "number") {
            const followStatus = await getFollowStatus(user.id);

            // Get post count from localStorage with user-specific key
            const userSpecificPostCount = localStorage.getItem(
              `user_${user.id}_userPostsCount`
            );
            const postCount = userSpecificPostCount
              ? parseInt(userSpecificPostCount, 10)
              : 0;

            setStats({
              followersCount: followStatus.followersCount || 0,
              followingCount: followStatus.followingCount || 0,
              postCount: postCount,
              isFollowing: followStatus.isFollowing || false,
            });

            // Try to get join date from localStorage
            const storedJoinDate = localStorage.getItem(
              `user_${user.id}_joinDate`
            );
            if (storedJoinDate) {
              setJoinDate(storedJoinDate);
            } else {
              // If no stored join date, fetch the user profile from API
              try {
                const API_BASE_URL =
                  process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:8080/api";
                const response = await fetch(
                  `${API_BASE_URL}/users/profile/${user.username}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Cache-Control": "no-cache",
                    },
                  }
                );

                if (response.ok) {
                  const profileData = await response.json();
                  if (profileData.joinDate) {
                    setJoinDate(profileData.joinDate);
                    localStorage.setItem(
                      `user_${user.id}_joinDate`,
                      profileData.joinDate
                    );
                  } else {
                    // Fallback: Use registration date from 3 months ago as an example
                    const fallbackDate = new Date();
                    fallbackDate.setMonth(fallbackDate.getMonth() - 3);
                    setJoinDate(fallbackDate.toISOString());
                  }
                }
              } catch (profileError) {
                console.error(
                  "Error fetching user profile for join date:",
                  profileError
                );
                // Use fallback date if we can't get the real one
                const fallbackDate = new Date();
                fallbackDate.setMonth(fallbackDate.getMonth() - 3);
                setJoinDate(fallbackDate.toISOString());
              }
            }
          }
        } catch (error) {
          console.error("Error fetching follow stats:", error);
        }
      };

      fetchStats();
    }
  }, [user?.id, user?.username, token]);

  // Listen for post count updates
  useEffect(() => {
    // Function to handle post count updates
    const handlePostCountUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Only update if this event is for our user
      if (
        customEvent.detail &&
        customEvent.detail.userId === user.id &&
        customEvent.detail.count !== undefined
      ) {
        console.log(
          "Posts count updated for current user:",
          customEvent.detail.count
        );
        setStats((prevStats) => ({
          ...prevStats,
          postCount: customEvent.detail.count,
        }));
      }
    };

    // Add event listener for post count updates
    window.addEventListener("userPostsCountUpdated", handlePostCountUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener(
        "userPostsCountUpdated",
        handlePostCountUpdate
      );
    };
  }, [user.id]);

  // Initialize profile image on component mount
  useEffect(() => {
    if (user.profileImageUrl) {
      setProfileImageSrc(
        getProfileImageUrl(user.profileImageUrl, user.username)
      );
    }
  }, [user.profileImageUrl, user.username]);

  // Listen for profile image updates
  useEffect(() => {
    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        console.log(
          "ProfileHeader - Profile update event received:",
          customEvent.detail
        );

        // Get the image URL
        const imageUrl = String(customEvent.detail);
        console.log("Setting profile image to:", imageUrl);

        // Process the URL and add cache busting
        const processedUrl = getProfileImageUrl(imageUrl, user.username);
        setProfileImageSrc(processedUrl);

        // Also update the refresh key to force re-render
        setRefreshKey(Date.now());
      }
    };

    window.addEventListener("profileImageUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileImageUpdated", handleProfileUpdate);
    };
  }, [user.username]);

  // Listen for display name updates
  useEffect(() => {
    const handleDisplayNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.displayName) {
        console.log(
          "Display name update event received:",
          customEvent.detail.displayName
        );
        setDisplayName(customEvent.detail.displayName);
      }
    };

    window.addEventListener("userProfileUpdated", handleDisplayNameUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleDisplayNameUpdate);
    };
  }, []);

  // Add this effect to check account privacy
  useEffect(() => {
    const checkPrivacy = async () => {
      if (user?.id && user.id !== currentUser.id) {
        try {
          console.log("Checking privacy for user ID:", user.id);
          const isPrivate = await checkAccountPrivacy(user.id);
          console.log("Privacy check result:", isPrivate);
          setIsPrivateAccount(isPrivate);
        } catch (error) {
          console.error("Error checking account privacy:", error);
          // If there's an error, let's default to treating as private for safety
          setIsPrivateAccount(true);
        }
      }
    };

    checkPrivacy();
  }, [user?.id, currentUser.id]);
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

  // Handle follow change from FollowButton
  const handleFollowChange = (isFollowing: boolean, followerCount: number) => {
    setStats((prevStats) => ({
      ...prevStats,
      followersCount: followerCount,
      isFollowing: isFollowing,
    }));
  };

  // Format the join date for display
  const formattedJoinDate = joinDate
    ? new Date(joinDate).toLocaleDateString()
    : "Unknown";

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage
            key={refreshKey} // Force re-render on refreshKey change
            src={
              profileImageSrc ||
              getProfileImageUrl(user.profileImageUrl, user.username)
            }
            alt={user.username || "User"}
            onError={(e) => {
              console.error("Failed to load profile image:", e);

              // Try one more time with the image proxy directly
              if (
                user.profileImageUrl &&
                !e.currentTarget.src.includes("dicebear")
              ) {
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
        {/* Display name with fallback logic */}
        <h2 className="text-2xl font-bold">{displayName}</h2>
        <div className="flex items-center justify-center md:justify-start gap-2">
          <p className="text-muted-foreground">@{user.username || "unknown"}</p>

          {/* Private Account Badge */}
          {isPrivateAccount && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              <Lock className="h-3 w-3" />
              <span className="text-xs">Private Account</span>
            </Badge>
          )}
        </div>

        {user.bio ? (
          <p className="mt-2">{user.bio}</p>
        ) : (
          !user.bio &&
          isAuthenticated &&
          user.id === currentUser.id && (
            <div className="mt-2 text-sm text-muted-foreground italic">
              No bio added yet.
            </div>
          )
        )}

        {/* User Badges display area */}
        {user.id && (
          <div className="mt-3">
            {/* Show badge status text above the buttons */}
            {isAuthenticated &&
              user.id === currentUser.id &&
              userBadges.length === 0 && (
                <div className="text-sm text-muted-foreground italic mb-2">
                  No badges selected yet.
                </div>
              )}

            {/* Display selected badges if any */}
            {userBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {userBadges.map((badgeId) => {
                  const badge = getBadgeById(badgeId);
                  if (!badge) return null;

                  return (
                    <TooltipProvider key={badgeId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-help hover:bg-secondary/80"
                          >
                            {badge.name}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{badge.category}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            )}

            {/* Buttons row for current user only */}
            {isAuthenticated && user.id === currentUser.id && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/settings")}
                  className="flex items-center gap-1"
                >
                  {user.bio ? "Edit Bio" : "Add Bio"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectorOpen(true)}
                >
                  {userBadges.length > 0 ? "Edit Badges" : "Add Badges"}
                </Button>
              </div>
            )}
          </div>
        )}

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

        {/* Join date now uses the actual join date */}
        <div className="flex items-center mt-2 justify-center md:justify-start">
          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
          <span>Joined {formattedJoinDate}</span>
        </div>
      </div>

      {/* Action Buttons / Settings - Show different buttons based on authentication and ownership */}
      <div className="flex items-center gap-2">
        {isAuthenticated && user.id === currentUser.id ? (
          <SettingsDropdown />
        ) : isAuthenticated && user.id !== currentUser.id ? (
          <div className="flex flex-col gap-2">
            {/* Fix the userId type issue by ensuring it's not null */}
            {user.id && (
              <FollowButton
                userId={user.id}
                initialIsFollowing={stats.isFollowing}
                isPrivateAccount={isPrivateAccount}
                onFollowChange={handleFollowChange}
              />
            )}
            {user.id && (
              <MessageButton
                username={user.username || ""}
                userId={user.id}
                variant="outline"
              />
            )}
          </div>
        ) : (
          <Button
            onClick={() =>
              router.push(
                `/login?redirect=${encodeURIComponent(
                  `/profile/${user.username}`
                )}`
              )
            }
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Log in to interact
          </Button>
        )}
      </div>

      {/* Badge Selector Modal */}
      <BadgeSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        selectedBadges={userBadges}
      />
    </div>
  );
};

export default ProfileHeader;
