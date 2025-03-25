import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostComments, getPostById, likePost } from "@/api/posts"; // Update import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentModal from "@/components/comments/CommentModal";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import Navbar from "@/components/navbar/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Skeleton } from "@/components/ui/skeleton";

const PostDetail = () => {
  const router = useRouter();
  const { postId } = router.query;
  const user = useSelector((state: RootState) => state.user);

  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const numericPostId = Array.isArray(postId) ? parseInt(postId[0]) : parseInt(postId);
        
        if (isNaN(numericPostId)) {
          setError("Invalid post ID");
          setIsLoading(false);
          return;
        }
        
        // Fetch post data
        const postData = await getPostById(numericPostId);
        if (!postData) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }
        
        setPost(postData);
        setLikesCount(postData.likes || 0);
        setIsLiked(postData.isLiked || false);
        
        // Fetch comments
        try {
          const commentsData = await getPostComments(numericPostId);
          setComments(commentsData || []);
        } catch (commentError) {
          console.error("Error fetching comments:", commentError);
          // Don't set error state here to allow the post to still display
          setComments([]);
        }
      } catch (err) {
        setError("Error loading post");
        console.error("Error in fetchPostData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const handleLike = async () => {
    if (!post || !user.token) return;
    
    try {
      await likePost(post.id);
      
      // Toggle liked state and update count immediately in UI
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCommentAdded = async () => {
    if (!post) return;
    
    // Refresh comments
    try {
      const commentsData = await getPostComments(post.id);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
    
    setIsCommentModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6 flex items-center justify-center h-64">
          <div className="space-y-4 w-full">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6">
          <Button onClick={handleBack} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Card className="p-6 shadow-lg border border-border rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "Post not found"}</p>
              <Button onClick={handleBack} className="mt-4">
                Go Back
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
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Button onClick={handleBack} variant="ghost" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card className="p-6 shadow-lg border border-border rounded-lg">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">{post.author}</h3>
            <p className="mt-2 text-md text-foreground">{post.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <Button 
              onClick={handleLike} 
              variant="ghost" 
              className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>
            
            <Button 
              onClick={() => setIsCommentModalOpen(true)} 
              variant="ghost" 
              className="flex items-center gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              {comments.length} Comments
            </Button>
          </div>
        </Card>

        <h2 className="text-xl font-semibold mt-6">Comments</h2>
        <div className="space-y-4">
          {comments.length > 0 ? comments.map((comment) => (
            <Card key={comment.id} className="p-4 shadow-md border border-border rounded-lg">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {comment.author?.username || "Anonymous"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm">{comment.content}</p>
              </CardContent>
            </Card>
          )) : (
            <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
          )}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button onClick={() => setIsCommentModalOpen(true)} className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> Add Comment
          </Button>
        </div>
      </div>
      
      <CommentModal 
        postId={post.id} 
        isOpen={isCommentModalOpen} 
        onClose={() => setIsCommentModalOpen(false)}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default PostDetail;