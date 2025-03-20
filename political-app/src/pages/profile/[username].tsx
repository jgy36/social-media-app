// pages/profile/[username].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { User as UserIcon, Users, Calendar, Mail, MessagesSquare, ArrowLeft } from "lucide-react";
import axios from "axios";

// Interface for the user profile response
interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username || typeof username !== "string") return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const profileResponse = await axios.get<UserProfile>(`${API_BASE_URL}/users/profile/${username}`);
        
        setProfile(profileResponse.data);
        
        // Create mock posts if we can't fetch them
        let userPosts: PostType[] = [];
        
        try {
          // Try to fetch user posts - this might require auth
          const postsResponse = await axios.get<PostType[]>(`${API_BASE_URL}/users/profile/${username}/posts`, {
            headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {}
          });
          userPosts = postsResponse.data;
        } catch (postsError) {
          console.warn("Could not fetch posts, using empty array:", postsError);
          // Create mock data for development only
          if (process.env.NODE_ENV === 'development') {
            userPosts = [
              {
                id: 1,
                author: username as string,
                content: `This is a sample post by ${username}. Posts may require authentication to view.`,
                likes: 5,
                createdAt: new Date().toISOString(),
                commentsCount: 2
              }
            ];
          }
        }
        
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // If we get a 401 error, create a minimal profile for display
        // Check if error is an Axios error with response status 401
        const axiosError = err as { response?: { status?: number } };
        if (axiosError && axiosError.response && axiosError.response.status === 401) {
          // Create a minimal profile
          const minimalProfile: UserProfile = {
            id: 0,
            username: username as string,
            joinDate: new Date().toISOString(),
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            isFollowing: false,
            bio: "Profile details require authentication. Please log in to see more."
          };
          
          setProfile(minimalProfile);
          setPosts([]);
        } else {
          setError("Failed to load user profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username, currentUser.token]);

  const handleFollowToggle = async () => {
    if (!profile || !isAuthenticated) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`);
      }
      return;
    }
    
    try {
      if (profile.isFollowing) {
        // Unfollow the user
        await axios.delete(`${API_BASE_URL}/users/unfollow/${profile.username}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      } else {
        // Follow the user
        await axios.post(`${API_BASE_URL}/users/follow/${profile.username}`, {}, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      }
      
      // Toggle following state and update follower count locally
      setProfile({
        ...profile,
        isFollowing: !profile.isFollowing,
        followersCount: profile.isFollowing 
          ? profile.followersCount - 1 
          : profile.followersCount + 1
      });
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleBack = () => {
    router.back();
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
          <Button 
            onClick={handleBack}
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "User not found"}</p>
              <Button onClick={() => router.push("/feed")} className="mt-4">
                Return to Feed
              </Button>
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
        <Button 
          onClick={handleBack}
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
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
                
                <div className="flex flex-wrap items-center gap-4 mt-3 justify-center md:justify-start">
                  <div className="flex items-center">
                    <MessagesSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span><strong>{profile.postsCount}</strong> Posts</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span><strong>{profile.followersCount}</strong> Followers</span>
                  </div>
                  
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span><strong>{profile.followingCount}</strong> Following</span>
                  </div>
                  
                  {profile.joinDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 md:mt-0">
                {!isAuthenticated && (
                  <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}>
                    Log in to interact
                  </Button>
                )}
                
                {isAuthenticated && !isCurrentUserProfile && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleFollowToggle}
                      variant={profile.isFollowing ? "outline" : "default"}
                      className={profile.isFollowing ? "border-primary" : ""}
                    >
                      {profile.isFollowing ? "Following" : "Follow"}
                    </Button>
                    
                    <Button variant="outline">
                      <Mail className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Message</span>
                    </Button>
                  </div>
                )}
                
                {isAuthenticated && isCurrentUserProfile && (
                  <Button onClick={() => router.push("/settings")}>
                    Edit Profile
                  </Button>
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
                <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view this user&apos;s posts.
                </p>
                <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/profile/${username}`)}`)}>
                  Log In
                </Button>
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
                <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  This user hasn&#39;t posted anything.
                </p>
              </Card>
            )}
          </TabsContent>
          
          {/* Other tabs (for future implementation) */}
          <TabsContent value="comments">
            <Card className="p-8 text-center">
              <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Comments Coming Soon</h3>
              <p className="text-muted-foreground">This feature is being developed.</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="followers">
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Followers List Coming Soon</h3>
              <p className="text-muted-foreground">This feature is being developed.</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="following">
            <Card className="p-8 text-center">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Following List Coming Soon</h3>
              <p className="text-muted-foreground">This feature is being developed.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;