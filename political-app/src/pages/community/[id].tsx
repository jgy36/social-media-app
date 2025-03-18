// pages/community/[id].tsx - Enhanced version
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { Users, Bell, BellOff, MessageCircle, Info, Calendar, Flame, TrendingUp, Shield, User, ArrowLeft, Loader2 } from "lucide-react";
import { getCommunityBySlug, getCommunityPosts, joinCommunity, leaveCommunity, createCommunityPost } from "@/utils/api";

interface CommunityData {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  rules: string[];
  moderators: string[];
  banner?: string;
  color?: string;
  isJoined: boolean;
  isNotificationsOn: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const CommunityPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;

  // Fetch community data when ID changes
  useEffect(() => {
    if (id && typeof id === "string") {
      const loadCommunity = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch community details
          const communityData = await getCommunityBySlug(id);
          
          if (!communityData) {
            throw new Error("Community not found");
          }
          
          setCommunity(communityData);
          setIsJoined(communityData.isJoined || false);
          setIsNotificationsOn(communityData.isNotificationsOn || false);
          setMemberCount(communityData.members || 0);
          
          // Fetch posts for this community
          const postsData = await getCommunityPosts(id);
          setPosts(postsData);
          
        } catch (err) {
          console.error("Error loading community:", err);
          setError("Failed to load community data");
          
          // Fallback to mock data in development mode if API fails
          if (process.env.NODE_ENV === 'development') {
            // Create mock community data matching the structure from API
            const mockCommunity: CommunityData = {
              id: id as string,
              name: id === 'democrat' ? 'Democrat' : 
                   id === 'republican' ? 'Republican' : 
                   id === 'libertarian' ? 'Libertarian' : 
                   id === 'independent' ? 'Independent' : 'Political Community',
              description: `This is the ${id} community for political discussions.`,
              members: 12345,
              created: new Date(2023, 0, 1).toISOString(),
              rules: [
                "Be respectful of other members",
                "No hate speech or personal attacks",
                "Focus on policy discussion, not personal attacks",
                "Cite sources for claims when possible"
              ],
              moderators: ["admin", "moderator1"],
              color: id === 'democrat' ? '#3b82f6' : 
                     id === 'republican' ? '#ef4444' : 
                     id === 'libertarian' ? '#eab308' : 
                     id === 'independent' ? '#a855f7' : '#3b82f6',
              isJoined: false,
              isNotificationsOn: false
            };
            
            setCommunity(mockCommunity);
            setMemberCount(mockCommunity.members);
            
            // Mock posts
            const mockPosts: PostType[] = [
              {
                id: 1,
                author: "User1",
                content: `Welcome to the ${id} community! This is a great place to discuss ${id} politics.`,
                likes: 42,
                createdAt: new Date(2023, 10, 15).toISOString(),
                commentsCount: 5
              },
              {
                id: 2,
                author: "User2",
                content: `I'm excited to share my thoughts on recent ${id} policy developments. #${id} #policy`,
                likes: 21,
                createdAt: new Date(2023, 10, 10).toISOString(),
                commentsCount: 2
              }
            ];
            
            setPosts(mockPosts);
            setError(null); // Clear error if using mock data
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadCommunity();
    }
  }, [id]);

  // Handle joining/leaving the community
  const handleToggleMembership = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/community/${id}`)}`);
      return;
    }

    if (!community) return;
    
    // Optimistically update UI
    setIsJoined(!isJoined);
    
    // Update member count
    setMemberCount(prevCount => isJoined ? prevCount - 1 : prevCount + 1);
    
    try {
      let success: boolean;
      
      if (isJoined) {
        // Leave community
        success = await leaveCommunity(community.id);
      } else {
        // Join community
        success = await joinCommunity(community.id);
      }
      
      if (!success) {
        // Revert if API call failed
        setIsJoined(!isJoined);
        setMemberCount(prevCount => isJoined ? prevCount + 1 : prevCount - 1);
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);
      
      // Revert UI state on error
      setIsJoined(!isJoined);
      setMemberCount(prevCount => isJoined ? prevCount + 1 : prevCount - 1);
    }
  };

  // Toggle notifications
  const handleToggleNotifications = () => {
    setIsNotificationsOn(!isNotificationsOn);
    
    // In a real app, you'd make an API call here to update notification preferences
  };

  // Submit a new post to the community
  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated || !community) return;
    
    setIsSubmitting(true);
    
    try {
      const newPost = await createCommunityPost(community.id, newPostContent);
      
      if (newPost) {
        // Add the new post to the list
        setPosts(prevPosts => [newPost, ...prevPosts]);
        
        // Clear the input
        setNewPostContent("");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to communities list
  const handleBack = () => {
    router.push('/community');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4 flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !community) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-5xl mx-auto p-4">
          <Button onClick={handleBack} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Community Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {error || `The community "${id}" doesn't exist or may have been removed.`}
              </p>
              <Button
                className="mt-4"
                onClick={handleBack}
              >
                Back to Communities
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

      {/* Community Banner */}
      <div
        className="w-full h-40 bg-gradient-to-r from-primary/80 to-primary/30 relative"
        style={{
          backgroundImage: community.banner ? `url(${community.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: community.color || 'var(--primary)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        <Button 
          onClick={handleBack}
          variant="ghost" 
          className="mb-4 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {/* Community Header */}
        <Card className="shadow-lg border border-border mb-6">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {community.name}
                  <Badge
                    variant="outline"
                    className="ml-2 bg-primary/10 text-primary"
                  >
                    {memberCount.toLocaleString()} members
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {community.description}
                </CardDescription>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={isJoined ? "outline" : "default"}
                  className={`${
                    isJoined ? "border-primary/50 text-primary" : ""
                  }`}
                  onClick={handleToggleMembership}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isJoined ? "Joined" : "Join"}
                </Button>

                {isJoined && (
                  <Button
                    variant="outline"
                    className={`${
                      isNotificationsOn ? "border-primary/50" : ""
                    }`}
                    onClick={handleToggleNotifications}
                  >
                    {isNotificationsOn ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Created {new Date(community.created).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Posts & Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post (if logged in and joined) */}
            {isAuthenticated && isJoined && (
              <Card className="shadow-md border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Create Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[120px] resize-none"
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitPost}
                        disabled={isSubmitting || !newPostContent.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          "Post"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Not joined message */}
            {isAuthenticated && !isJoined && (
              <Card className="shadow-md border border-border bg-muted/20 mb-4">
                <CardContent className="p-4 text-center">
                  <p className="mb-2">Join this community to post and participate in discussions</p>
                  <Button onClick={handleToggleMembership}>
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {/* Login message */}
            {!isAuthenticated && (
              <Card className="shadow-md border border-border bg-muted/20 mb-4">
                <CardContent className="p-4 text-center">
                  <p className="mb-2">Sign in to join the community and participate in discussions</p>
                  <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/community/${id}`)}`)}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Community Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="posts">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger value="hot">
                  <Flame className="h-4 w-4 mr-2" />
                  Hot
                </TabsTrigger>
                <TabsTrigger value="trending">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
              </TabsList>

              {/* Posts Tab Content */}
              <TabsContent value="posts">
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to post in this community!
                    </p>
                    {!isJoined && isAuthenticated && (
                      <Button className="mt-4" onClick={handleToggleMembership}>
                        Join to Post
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <Button 
                        className="mt-4" 
                        onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/community/${id}`)}`)}>
                        Sign In to Post
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Hot Tab Content */}
              <TabsContent value="hot">
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {[...posts]
                      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                      .map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to post in this community!
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Trending Tab Content */}
              <TabsContent value="trending">
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {[...posts]
                      .sort((a, b) => {
                        // Handle undefined commentsCount with fallback to 0
                        const aComments = a.commentsCount ?? 0;
                        const bComments = b.commentsCount ?? 0;
                        return bComments - aComments;
                      })
                      .map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium mb-1">No trending posts yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Posts with the most comments will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Community Info & Rules */}
          <div className="space-y-6">
            {/* About Community */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{community.description}</p>

                <div>
                  <div className="flex items-center mb-1">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">
                      {memberCount.toLocaleString()} members
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Created {new Date(community.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!isJoined && (
                  <Button className="w-full" onClick={handleToggleMembership}>
                    Join Community
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Community Rules */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Community Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {community.rules && community.rules.length > 0 ? (
                    community.rules.map((rule, index) => (
                      <div key={index} className="pb-2">
                        <div className="font-medium">
                          {index + 1}. {rule}
                        </div>
                        {index < community.rules.length - 1 && (
                          <Separator className="mt-2" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No specific rules have been set for this community.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Moderators */}
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Moderators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {community.moderators && community.moderators.length > 0 ? (
                    community.moderators.map((mod, index) => (
                      <div key={index} className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/profile/${mod}`);
                          }}
                          className="text-primary hover:underline cursor-pointer"
                        >
                          {mod}
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No moderators listed for this community.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;