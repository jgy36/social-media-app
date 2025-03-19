// src/pages/hashtag/[tag].tsx - Updated version
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { Hash, TrendingUp, Calendar, MessagesSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPostsByHashtag, getHashtagInfo } from "@/utils/api";

// Helper function to format hashtag for display and API
const formatHashtag = (tag: string | string[] | undefined): { display: string, api: string } => {
  if (!tag) return { display: '', api: '' };
  
  const tagStr = Array.isArray(tag) ? tag[0] : tag;
  
  // Format for display (ensure it has a # prefix)
  const display = tagStr.startsWith('#') ? tagStr : `#${tagStr}`;
  
  // Format for API (remove # prefix if present)
  const api = tagStr.startsWith('#') ? tagStr.substring(1) : tagStr;
  
  return { display, api };
};

const HashtagPage = () => {
  const router = useRouter();
  const { tag } = router.query;
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");
  const [hashtagInfo, setHashtagInfo] = useState<{useCount: number} | null>(null);

  const { display: displayTag, api: apiTag } = formatHashtag(tag);

  useEffect(() => {
    if (!apiTag) return;

    const fetchHashtagData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch hashtag metadata first
        try {
          const tagInfo = await getHashtagInfo(apiTag);
          if (tagInfo) {
            setHashtagInfo(tagInfo);
            console.log("Hashtag info:", tagInfo);
          }
        } catch (infoError) {
          console.error("Error fetching hashtag info:", infoError);
          // Don't set error state, this is optional data
        }
        
        // Fetch posts with this hashtag
        const postsData = await getPostsByHashtag(apiTag);
        console.log(`Fetched ${postsData.length} posts for hashtag: ${apiTag}`);
        
        // Sort posts based on current preference
        const sortedPosts = [...postsData];
        if (sortBy === "trending") {
          sortedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else {
          sortedPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        }
        
        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching hashtag posts:", err);
        setError("Failed to load posts for this hashtag");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagData();
  }, [apiTag, sortBy]);

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <Button 
          onClick={handleBack}
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Hashtag Header */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              <Hash className="h-6 w-6 mr-2 text-primary" />
              {displayTag}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <MessagesSquare className="h-4 w-4 mr-1" />
                <span>{posts.length} posts</span>
                {hashtagInfo && (
                  <span className="ml-4">
                    <span className="font-medium">{hashtagInfo.useCount}</span> mentions
                  </span>
                )}
              </div>

              <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as "recent" | "trending")}>
                <TabsList>
                  <TabsTrigger value="recent" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Popular
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {error ? (
          <Card className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push("/feed")} className="mt-4">
              Return to Feed
            </Button>
          </Card>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Be the first to post with the {displayTag} hashtag!
            </p>
            <Button 
              onClick={() => router.push("/feed")}
              className="mt-4"
            >
              Back to Feed
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HashtagPage;