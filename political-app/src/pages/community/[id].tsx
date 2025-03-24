// src/pages/community/[id].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { joinCommunity as joinCommunityAction, leaveCommunity as leaveCommunityAction } from "@/redux/slices/communitySlice";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { Users, Bell, BellOff, MessageCircle, Info, Calendar, Flame, TrendingUp, Shield, User } from "lucide-react";
import { getCommunityBySlug, getCommunityPosts, joinCommunity, leaveCommunity, createCommunityPost } from "@/utils/api";
import BackButton from "@/components/navigation/BackButton";
import useSWR from "swr";
import axios from "axios";
import { GetServerSideProps } from "next";



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

interface ServerSideProps {
  initialCommunityData?: CommunityData;
  initialPosts?: PostType[];
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

// SWR fetcher function
const fetcher = async (url: string): Promise<CommunityData> => {
  try {
    const response = await axios.get<CommunityData>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

const CommunityPage = ({ initialCommunityData, initialPosts, error: serverError }: ServerSideProps) => {
  const router = useRouter();
  const { id } = router.query;
  const [community, setCommunity] = useState<CommunityData | null>(initialCommunityData || null);
  const [posts, setPosts] = useState<PostType[]>(initialPosts || []);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(!initialCommunityData);
  const [error, setError] = useState<string | null>(serverError || null);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(initialCommunityData?.isJoined || false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(initialCommunityData?.isNotificationsOn || false);
  const [memberCount, setMemberCount] = useState(initialCommunityData?.members || 0);
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!currentUser.token;
  const dispatch = useDispatch<AppDispatch>();
  // Get joined communities list from Redux
  const joinedCommunityIds = useSelector((state: RootState) => state.communities.joinedCommunities);

  // Use SWR for fetching community data
  const { data: swrCommunityData, error: swrError } = useSWR<CommunityData>(
    id ? `${API_BASE_URL}/communities/${id}` : null,
    id ? fetcher : null,
    {
      fallbackData: initialCommunityData,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        console.log("SWR fetched community data:", data);
      },
      onError: (err) => {
        console.error("SWR error fetching community:", err);
      }
    }
  );

  // Use SWR for fetching posts
  // Define a fetcher specifically for posts
  const fetchPosts = async (url: string): Promise<PostType[]> => {
    try {
      const response = await axios.get<PostType[]>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts from ${url}:`, error);
      throw error;
    }
  };
  
  const { data: swrPosts } = useSWR<PostType[]>(
    id ? `${API_BASE_URL}/communities/${id}/posts` : null,
    id ? fetchPosts : null,
    {
      fallbackData: initialPosts,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        console.log(`SWR fetched ${Array.isArray(data) ? data.length : 0} posts for community`);
      }
    }
  );

  // Initial debug logging
  useEffect(() => {
    console.log("Community page loaded");
    console.log("Router object:", router);
    console.log("Community ID from URL:", id);
    
    // Check if ID is available and valid
    if (id && typeof id === "string") {
      console.log(`Loading community data for ID: ${id}`);
    } else {
      console.log("Waiting for ID parameter to be available...");
    }
  }, [id, router]);

  // Update state from SWR data when it changes
  useEffect(() => {
    if (swrCommunityData) {
      setCommunity(swrCommunityData);
      // Use Redux state as source of truth for joined status 
      setIsJoined(joinedCommunityIds.includes(swrCommunityData.id));
      setIsNotificationsOn(swrCommunityData.isNotificationsOn || false);
      setMemberCount(swrCommunityData.members || 0);
    }
    
    if (swrError) {
      setError("Failed to load community data");
    }
    
    setIsLoading(false);
  }, [swrCommunityData, swrError, joinedCommunityIds]);

  // Update posts from SWR data
  useEffect(() => {
    if (swrPosts) {
      setPosts(swrPosts);
    }
  }, [swrPosts]);

  // Fetch community data when ID changes - Backup method with guard clause
  useEffect(() => {
    // GUARD CLAUSE: Only proceed if we have a valid ID and no server-side data
    if (!id || typeof id !== "string" || initialCommunityData) {
      return;
    }
    
    const loadCommunity = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log(`Starting to load community data for ID: ${id}`);
      
      try {
        // Check if this community is in our joined list from Redux
        const isInJoinedList = joinedCommunityIds.includes(id as string);
        console.log(`Community ${id} in joined list: ${isInJoinedList}`);
        
        // Fetch community details with explicit logging
        console.log(`Fetching data from API for community: ${id}`);
        const communityData = await getCommunityBySlug(id as string);
        
        if (!communityData) {
          console.error(`API returned no data for community: ${id}`);
          throw new Error("Community not found");
        }
        
        console.log("Community data received:", communityData);
        setCommunity(communityData);
        // Use Redux state as source of truth for joined status 
        setIsJoined(isInJoinedList);
        setIsNotificationsOn(communityData.isNotificationsOn || false);
        setMemberCount(communityData.members || 0);
        
        // Fetch posts for this community
        try {
          console.log(`Fetching posts for community: ${id}`);
          const postsData = await getCommunityPosts(id as string);
          console.log(`Received ${postsData.length} posts for community`);
          setPosts(postsData);
        } catch (postsErr) {
          console.warn("Error fetching posts, using empty array:", postsErr);
          setPosts([]);
        }
        
      } catch (err) {
        console.error("Error loading community:", err);
        setError("Failed to load community data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCommunity();
  }, [id, joinedCommunityIds, initialCommunityData]);

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
        
        // Update Redux store
        if (success) {
          dispatch(leaveCommunityAction(community.id));
          console.log(`Left community ${community.id}, removed from Redux store`);
        }
      } else {
        // Join community
        success = await joinCommunity(community.id);
        
        // Update Redux store
        if (success) {
          dispatch(joinCommunityAction(community.id));
          console.log(`Joined community ${community.id}, added to Redux store`);
        }
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

  // Debug component state
  console.log("Component state:", {
    isLoading,
    error,
    hasCommunity: !!community, 
    membersCount: community?.members || 0,
    postsCount: posts?.length || 0
  });

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
          <BackButton fallbackUrl="/community" className="mb-4" />
          
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

  console.log("Rendering community page with data:", community);

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
        <BackButton fallbackUrl="/community" className="mb-4 bg-background/80 backdrop-blur-sm" />
        
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
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
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

// Server-side rendering to get initial data
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  if (!id) {
    return {
      props: {
        error: "No community ID provided"
      }
    };
  }
  
  try {
    console.log(`[SSR] Fetching data for community: ${id}`);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    
    // Fetch community data
    const communityResponse = await axios.get(`${API_BASE_URL}/communities/${id}`);
    const communityData = communityResponse.data;
    
    // Fetch posts
    const postsResponse = await axios.get<PostType[]>(`${API_BASE_URL}/communities/${id}/posts`);
    const posts = postsResponse.data;
    
    console.log(`[SSR] Successfully fetched community data and ${posts.length} posts`);
    
    return {
      props: {
        initialCommunityData: communityData,
        initialPosts: posts
      }
    };
  } catch (error) {
    console.error(`[SSR] Error fetching data for community ${id}:`, error);
    
    // Return error but don't fail the page load - client will retry
    return {
      props: {
        error: "Failed to load community data"
      }
    };
  }
};

export default CommunityPage;