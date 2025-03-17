// pages/community/[id].tsx
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
import { PostType } from "@/types/post";
import { Users, Bell, BellOff, MessageCircle, Info, Calendar, Flame, TrendingUp, Shield, User } from "lucide-react";
import Post from "@/components/feed/Post";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";

// Types
interface CommunityData {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  rules: string[];
  moderators: string[];
  banner: string;
  color: string;
  isJoined: boolean;
  isNotificationsOn: boolean;
}

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

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;

  useEffect(() => {
    if (id && typeof id === "string") {
      const loadCommunity = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // Fetch community details
          const communityResponse = await axios.get(`${API_BASE_URL}/communities/${id}`, {
            headers: currentUser.token ? { Authorization: `Bearer ${currentUser.token}` } : {}
          });
          
          setCommunity(communityResponse.data);
          
          // Fetch posts for this community
          const postsResponse = await axios.get(`${API_BASE_URL}/communities/${id}/posts`);
          setPosts(postsResponse.data);
          
        } catch (err) {
          console.error("Error loading community:", err);
          setError("Failed to load community data");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadCommunity();
    }
  }, [id, currentUser.token]);

  const handleJoinCommunity = async () => {
    if (!community) return;
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/community/${id}`)}`);
      return;
    }

    try {
      if (community.isJoined) {
        // Leave community
        await axios.delete(`${API_BASE_URL}/communities/${community.id}/leave`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        // Update local state
        setCommunity({
          ...community,
          isJoined: false,
          isNotificationsOn: false,
          members: community.members - 1
        });
      } else {
        // Join community
        await axios.post(`${API_BASE_URL}/communities/${community.id}/join`, {}, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        
        // Update local state
        setCommunity({
          ...community,
          isJoined: true,
          members: community.members + 1
        });
      }
    } catch (error) {
      console.error("Error toggling community membership:", error);
    }
  };

  const handleToggleNotifications = async () => {
    if (!community || !isAuthenticated) return;
    
    // Note: This would typically call a backend endpoint to toggle notifications
    // For now, we'll just update the local state as a demonstration
    setCommunity({
      ...community,
      isNotificationsOn: !community.isNotificationsOn
    });
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated || !community) return;
    
    setIsSubmitting(true);
    
    try {
      // Create post in the community
      const response = await axios.post(`${API_BASE_URL}/posts/community`, {
        communityId: community.id,
        content: newPostContent
      }, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      
      // Add the new post to the list
      setPosts([response.data, ...posts]);
      
      // Clear the input
      setNewPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                onClick={() => router.push("/community")}
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
                    {community.members.toLocaleString()} members
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  {community.description}
                </CardDescription>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={community.isJoined ? "outline" : "default"}
                  className={`${
                    community.isJoined ? "border-primary/50 text-primary" : ""
                  }`}
                  onClick={handleJoinCommunity}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {community.isJoined ? "Joined" : "Join"}
                </Button>

                {community.isJoined && (
                  <Button
                    variant="outline"
                    className={`${
                      community.isNotificationsOn ? "border-primary/50" : ""
                    }`}
                    onClick={handleToggleNotifications}
                  >
                    {community.isNotificationsOn ? (
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
            {isAuthenticated && community.isJoined && (
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
                        {isSubmitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
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
                    {!community.isJoined && (
                      <Button className="mt-4" onClick={handleJoinCommunity}>
                        Join to Post
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Hot Tab Content */}
              <TabsContent value="hot">
                <div className="space-y-4">
                  {posts
                    .sort((a, b) => b.likes - a.likes)
                    .map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                </div>
              </TabsContent>

              {/* Trending Tab Content */}
              <TabsContent value="trending">
                <div className="space-y-4">
                  {posts
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
                      {community.members.toLocaleString()} members
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Created {new Date(community.created).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!community.isJoined && (
                  <Button className="w-full" onClick={handleJoinCommunity}>
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