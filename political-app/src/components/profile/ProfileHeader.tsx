/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/profile/ProfileHeader.tsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import SettingsDropdown from "./SettingsDropdown";
import UserStats from "./UserStats";
import { getFollowStatus } from "@/api/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { getProfileImageUrl } from "@/utils/imageUtils";

const ProfileHeader = () => {
  const user = useSelector((state: RootState) => state.user);
  const token = useSelector((state: RootState) => state.user.token);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && token) {
      setLoading(true);
      setError(null);

      const fetchStats = async () => {
        try {
          if (typeof user.id === "number") {
            const followStatus = await getFollowStatus(user.id);
            setStats({
              followersCount: followStatus.followersCount || 0,
              followingCount: followStatus.followingCount || 0,
              postCount: 0, // We'll set this from the API response if available
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

  // Handle stats changes (for example, when a user is followed/unfollowed in modals)
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
            src={getProfileImageUrl(user.profileImageUrl, user.username)}
            alt={user.username || "User"}
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

        { user.bio && (
          <p className="mt-2">{user.bio}</p>
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