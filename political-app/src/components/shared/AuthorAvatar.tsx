// src/components/shared/AuthorAvatar.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";

// Simple cache to avoid repeated API calls for the same username
const profileCache: Record<string, {
  profileImageUrl: string | null,
  timestamp: number
}> = {};

// Cache timeout (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

interface AuthorAvatarProps {
  username: string;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
  username,
  size = 32,
  className = '',
  onClick
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setIsLoading(false);
        return;
      }

      // Check cache first
      const now = Date.now();
      const cachedData = profileCache[username];
      
      if (cachedData && (now - cachedData.timestamp < CACHE_TIMEOUT)) {
        console.log(`Using cached profile for ${username}`);
        setImageUrl(cachedData.profileImageUrl);
        setIsLoading(false);
        return;
      }

      // Set default image first
      const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      setImageUrl(defaultImage);

      try {
        // Fetch profile data directly from API
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
        console.log(`Fetching profile for ${username} from ${API_BASE_URL}/users/profile/${username}`);
        
        const response = await axios.get(`${API_BASE_URL}/users/profile/${username}`, {
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });

        const profile = response.data;
        
        // Update cache
        profileCache[username] = {
          profileImageUrl: profile.profileImageUrl || null,
          timestamp: now
        };

        // Only update if we got a profile image URL
        if (profile.profileImageUrl) {
          console.log(`Got profile image for ${username}:`, profile.profileImageUrl);
          const processedUrl = getProfileImageUrl(profile.profileImageUrl, username);
          setImageUrl(processedUrl);
        }
        
      } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        setError(true);
        // Keep using the default image
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleImageError = () => {
    console.log(`Image load failed for ${username}, trying fallback...`);
    setError(true);
    
    // Try to get the cached profile image URL
    const cachedData = profileCache[username];
    if (cachedData?.profileImageUrl) {
      // Try direct URL
      setImageUrl(getFullImageUrl(cachedData.profileImageUrl));
    } else {
      // Fall back to default avatar
      setImageUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`);
    }
  };

  // Custom styling based on size
  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  return (
    <div 
      className={`rounded-full overflow-hidden border border-border/30 dark:border-border/20 ${className}`}
      style={sizeStyle}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-xs font-semibold">
            {username.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default AuthorAvatar;