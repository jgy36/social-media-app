// src/components/shared/UserAvatar.tsx
import { useState, useEffect } from "react";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";

// Cache for profile image URLs to avoid repeated API calls
const profileImageCache: Record<string, string> = {};

interface UserAvatarProps {
  username: string;
  profileImageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
}

const UserAvatar = ({
  username,
  profileImageUrl = null,
  size = "md",
  onClick,
  className = "",
}: UserAvatarProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Determine size class
  const sizeClass =
    {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
      xl: "w-24 h-24",
    }[size] || "w-8 h-8";

  useEffect(() => {
    // If we already have a profile image URL, use it
    if (profileImageUrl) {
      setImageUrl(getProfileImageUrl(profileImageUrl, username));
      return;
    }

    // Check cache first
    if (profileImageCache[username]) {
      setImageUrl(profileImageCache[username]);
      return;
    }

    // No need to fetch for avatar if we're using the default
    if (!username) {
      setImageUrl(null);
      return;
    }

    // Otherwise let's use the default avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    setImageUrl(defaultAvatar);
  }, [username, profileImageUrl]);

  const handleError = () => {
    console.log(`Avatar image load failed for ${username}`);
    setError(true);

    // Try direct URL if available
    if (profileImageUrl) {
      setImageUrl(getFullImageUrl(profileImageUrl));
    } else {
      // Fall back to default avatar
      setImageUrl(
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      );
    }
  };

  if (loading) {
    return <Skeleton className={`${sizeClass} rounded-full ${className}`} />;
  }

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden border border-border/30 dark:border-border/20 ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={username || "User"}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-sm font-semibold">
            {username ? username.charAt(0).toUpperCase() : "U"}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
