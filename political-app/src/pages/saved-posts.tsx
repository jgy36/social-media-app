// src/pages/saved-posts.tsx
import { useState, useEffect } from "react";
import { getSavedPosts } from "@/api/posts"; // Update import
import { PostType } from "@/types/post";
import Post from "@/components/feed/Post";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const SavedPostsPage = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load saved posts
  useEffect(() => {
    const loadSavedPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getSavedPosts();
        setPosts(data);
      } catch (err) {
        console.error("Failed to load saved posts:", err);
        setError("Failed to load saved posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedPosts();
  }, []);

  // Function to force refresh the posts
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getSavedPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh saved posts:", err);
      setError("Failed to refresh. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Saved Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  <p>{error}</p>
                  <Button onClick={handleRefresh} variant="outline" className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved posts yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    When you save posts, they&apos;ll appear here for you to read later.
                    Click the Save button on any post to add it to your saved collection.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <Post key={post.id} post={{...post, isSaved: true}} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default SavedPostsPage;