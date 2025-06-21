// src/components/community/CommunityPostForm.tsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import { createCommunityPost } from "@/api/communities";

interface CommunityPostFormProps {
  communityId: string;
  isJoined: boolean;
  onPostCreated: () => void;
}

const CommunityPostForm = ({ communityId, isJoined, onPostCreated }: CommunityPostFormProps) => {
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Get auth state from Redux
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.token;
  
  // Submit a new post to the community
  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated) return;
    
    setIsSubmitting(true);
    
    try {
      const newPost = await createCommunityPost(communityId, newPostContent);
      
      if (newPost) {
        // Clear the input
        setNewPostContent("");
        
        // Notify parent component to refresh posts
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If user is authenticated and joined - show post form
  if (isAuthenticated && isJoined) {
    return (
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
    );
  }
  
  // If user is authenticated but not joined
  if (isAuthenticated && !isJoined) {
    return (
      <Card className="shadow-md border border-border bg-muted/20 mb-4">
        <CardContent className="p-4 text-center">
          <p className="mb-2">Join this community to post and participate in discussions</p>
          <Button onClick={() => router.push(`/community/${communityId}`)}>
            <Users className="h-4 w-4 mr-2" />
            Join Community
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // If user is not authenticated
  return (
    <Card className="shadow-md border border-border bg-muted/20 mb-4">
      <CardContent className="p-4 text-center">
        <p className="mb-2">Sign in to join the community and participate in discussions</p>
        <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/community/${communityId}`)}`)}>
          Sign In
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommunityPostForm;