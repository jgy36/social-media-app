/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/profile/[username].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { Calendar } from "lucide-react";
import axios from "axios";
import { getPreviousSection, storePreviousSection } from "@/utils/navigationStateManager";
import BackButton from "@/components/navigation/BackButton";
import UserStats from "@/components/profile/UserStats";
import FollowButton from "@/components/profile/FollowButton";
import { getFollowStatus, getPostsByUsername } from "@/api/users"; // Update import

// Interface for the user profile response
interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;
  // Check if this is the current user's profile
  const isCurrentUserProfile = profile?.username === currentUser.username;

  // Track the source section - where the user came from
  const [sourceSection, setSourceSection] = useState<string | null>(null);

  useEffect(() => {
    // Get and store the source section when component mounts
    const prevSection = getPreviousSection();
    setSourceSection(prevSection || 'community'); // Default to community
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username || typeof username !== "string") return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const profileResponse = await axios.get<UserProfile>(`${API_BASE_URL}/users/profile/${username}`);
        
        let userProfile = profileResponse.data;
        
        // If profile found, also get follow status
        if (userProfile && userProfile.id) {
          try {
            const followStatusResponse = await getFollowStatus(userProfile.id) as {
              isFollowing: boolean;
              followersCount: number;
              followingCount: number;
            };
            // Update profile with follow status and counts
            userProfile = {
              ...userProfile,
              isFollowing: followStatusResponse.isFollowing,
              followersCount: followStatusResponse.followersCount,
              followingCount: followStatusResponse.followingCount
            };
          } catch (followErr) {
            console.warn("Could not fetch follow status:", followErr);
          }
        }
        
        setProfile(userProfile);
        
        // Fetch user posts
        try {
          const userPosts = await getPostsByUsername(username);
          setPosts(userPosts);
        } catch (postsError) {
          console.warn("Could not fetch posts, using empty array:", postsError);
          setPosts([]);
        }
        
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser.token]);

  // Handle follow/unfollow profile update
  const handleFollowChange = (isFollowing: boolean, followerCount: number, followingCount: number) => {
    if (profile) {
      setProfile({
        ...profile,
        isFollowing,
        followersCount: followerCount,
        followingCount: followingCount
      });
    }
  };
  
  // Handle stats update
  const handleStatsChange = (newFollowersCount: number, newFollowingCount: number) => {
    if (profile) {
      setProfile({
        ...profile,
        followersCount: newFollowersCount,
        followingCount: newFollowingCount
      });
    }
  };

  // When going to another user's profile, preserve the navigation context
  const handleRedirectToProfile = (username: string) => {
    // Store the current section before navigating
    if (sourceSection) {
      storePreviousSection(sourceSection);
    }
    router.push(`/profile/${username}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <BackButton fallbackUrl="/community" className="mb-4" />
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-destructive">{error || "User not found"}</p>
              <button 
                onClick={() => router.push("/feed")} 
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Return to Feed
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <BackButton fallbackUrl="/community" className="mb-4" />
        
        {/* Profile Header */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} alt={profile.username} />
                  <AvatarFallback>
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                
                {profile.bio && (
                  <p className="mt-2 text-muted-foreground">{profile.bio}</p>
                )}
                
                {/* User Stats (Clickable for Following/Followers) */}
                <UserStats
                  userId={profile.id}
                  postsCount={profile.postsCount}
                  followersCount={profile.followersCount}
                  followingCount={profile.followingCount}
                  className="mt-3 justify-center md:justify-start"
                  onFollowChange={handleStatsChange}
                />
                
                {profile.joinDate && (
                  <div className="flex items-center mt-2 justify-center md:justify-start">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 md:mt-0">
                {!isAuthenticated && (
                  <button 
                    onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Log in to interact
                  </button>
                )}
                
                {isAuthenticated && !isCurrentUserProfile && (
                  <div className="flex gap-2">
                    <FollowButton
                      userId={profile.id}
                      initialIsFollowing={profile.isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                    
                    <button 
                      className="px-4 py-2 border border-border rounded hover:bg-accent"
                    >
                      Message
                    </button>
                  </div>
                )}
                
                {isAuthenticated && isCurrentUserProfile && (
                  <button 
                    onClick={() => router.push("/settings")}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          {/* Posts Tab */}
          <TabsContent value="posts">
            {!isAuthenticated && (
              <Card className="p-8 text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view this user&apos;s posts.
                </p>
                <button 
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Log In
                </button>
              </Card>
            )}
            
            {isAuthenticated && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))}
              </div>
            ) : isAuthenticated && (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  This user hasn&apos;t posted anything.
                </p>
              </Card>
            )}
          </TabsContent>
          
          {/* Other tabs use the modals directly */}
          <TabsContent value="comments">
            <Card className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Comments Coming Soon</h3>
              <p className="text-muted-foreground">This feature is being developed.</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="followers">
            {!isAuthenticated ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view this user&apos;s followers.
                </p>
                <button 
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Log In
                </button>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* This tab just shows an embedded version of the followers modal content */}
                {/* We'll use the modal directly from the UserStats component */}
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Click on the &quot;Followers&quot; count to see the complete list.
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="following">
            {!isAuthenticated ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view who this user follows.
                </p>
                <button 
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  Log In
                </button>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* This tab just shows an embedded version of the following modal content */}
                {/* We'll use the modal directly from the UserStats component */}
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Click on the &quot;Following&quot; count to see the complete list.
                  </p>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;