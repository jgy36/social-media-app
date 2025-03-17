// pages/hashtag/[tag].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import { Hash, TrendingUp, Calendar, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const HashtagPage = () => {
  const router = useRouter();
  const { tag } = router.query;
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "trending">("recent");

  // Format tag for display (remove # if present)
  const displayTag =
    typeof tag === "string" ? (tag.startsWith("#") ? tag : `#${tag}`) : "";

  // Format tag for API (remove # if present)
  const apiTag =
    typeof tag === "string"
      ? tag.startsWith("#")
        ? tag.substring(1)
        : tag
      : "";

  useEffect(() => {
    if (!apiTag) return;

    const fetchHashtagPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/hashtags/${apiTag}`);

        // Explicitly type response.data as PostType[]
        const fetchedPosts = response.data as PostType[];

        // Sort based on current preference
        let sortedPosts: PostType[] = [];
        if (sortBy === "trending") {
          sortedPosts = [...fetchedPosts].sort(
            (a, b) => (b.likes || 0) - (a.likes || 0)
          );
        } else {
          sortedPosts = [...fetchedPosts].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching hashtag posts:", err);
        setError("Failed to load posts for this hashtag");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagPosts();
  }, [apiTag, sortBy]);

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
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortBy === "recent" ? "default" : "outline"}
                  onClick={() => setSortBy("recent")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Recent
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "trending" ? "default" : "outline"}
                  onClick={() => setSortBy("trending")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </Button>
              </div>
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
          </Card>
        )}
      </div>
    </div>
  );
};

export default HashtagPage;
