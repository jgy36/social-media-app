import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPostComments, getPostById, likePost } from "@/api/posts"; // Update import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CommentModal from "@/components/comments/CommentModal";
import { Heart, MessageCircle, ArrowLeft, Repeat, Reply } from "lucide-react";
import { PostType } from "@/types/post";
import { CommentType } from "@/types/comment";
import Navbar from "@/components/navbar/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Skeleton } from "@/components/ui/skeleton";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import React from "react";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";

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
  
  // Track comment likes
  const [commentLikes, setCommentLikes] = useState<{ [commentId: number]: number }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: number]: boolean }>({});
  
  // For reply functionality
  const [replyPrefill, setReplyPrefill] = useState("");

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;

      setIsLoading(true);
      setError(null);

      try {
        const numericPostId = Array.isArray(postId)
          ? parseInt(postId[0])
          : parseInt(postId);

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

        // Normalize the repost properties for consistency
        const normalizedPost = {
          ...postData,
          isRepost: postData.isRepost || postData.repost || false,
        };

        setPost(normalizedPost);
        setLikesCount(normalizedPost.likes || 0);
        setIsLiked(normalizedPost.isLiked || false);

        // Fetch comments
        try {
          const commentsData = await getPostComments(numericPostId);
          setComments(commentsData || []);
          
          // Initialize comment likes tracking
          const initialLikes: { [commentId: number]: number } = {};
          const initialLiked: { [commentId: number]: boolean } = {};
          
          commentsData.forEach(comment => {
            initialLikes[comment.id] = comment.likesCount || 0;
            initialLiked[comment.id] = comment.likedByCurrentUser || false;
          });
          
          setCommentLikes(initialLikes);
          setLikedComments(initialLiked);
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
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleCommentLike = async (commentId: number) => {
    if (!user.token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    try {
      // Call the like comment API
      const response = await apiClient.post(`/posts/comments/${commentId}/like`);
      
      // Toggle the liked state in UI
      setLikedComments(prev => ({
        ...prev,
        [commentId]: !prev[commentId]
      }));
      
      // Update like count (increment if we just liked, decrement if we unliked)
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: likedComments[commentId] 
          ? Math.max(0, (prev[commentId] || 0) - 1) 
          : (prev[commentId] || 0) + 1
      }));
      
      toast({
        title: likedComments[commentId] ? "Comment unliked" : "Comment liked",
        description: likedComments[commentId] 
          ? "You removed your like from this comment" 
          : "You liked this comment",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error",
        description: "Failed to like the comment. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
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
      
      // Reset comment like tracking with new data
      const initialLikes: { [commentId: number]: number } = {};
      const initialLiked: { [commentId: number]: boolean } = {};
      
      commentsData.forEach(comment => {
        initialLikes[comment.id] = comment.likesCount || 0;
        initialLiked[comment.id] = comment.likedByCurrentUser || false;
      });
      
      setCommentLikes(initialLikes);
      setLikedComments(initialLiked);
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }

    setIsCommentModalOpen(false);
    setReplyPrefill(""); // Reset the reply prefill
  };
  
  const handleReply = (username: string) => {
    if (!user.token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    // Set the prefill text with the username
    setReplyPrefill(`@${username} `);
    
    // Open the comment modal
    setIsCommentModalOpen(true);
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
            {/* Add repost indicator */}
            {(post.isRepost === true || post.repost === true) && (
              <div className="mb-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  <Repeat className="h-3 w-3 mr-1" />
                  Reposted
                  {post.originalAuthor ? ` from @${post.originalAuthor}` : ""}
                </span>
              </div>
            )}

            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AuthorAvatar username={post.author} size={24} />@{post.author}
            </h3>

            <p className="mt-2 text-md text-foreground">{post.content}</p>

            {/* Add the original post content section for reposts */}
            {(post.isRepost === true || post.repost === true) &&
              post.originalPostId && (
                <div className="mb-2 mt-4 border-t border-border/10 pt-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    Original post:
                  </div>
                  {post.originalPostContent ? (
                    <div className="border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10 p-3 mt-2 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <AuthorAvatar
                          username={post.originalAuthor || "Unknown"}
                          size={20}
                          className="cursor-pointer"
                          onClick={() =>
                            post.originalAuthor &&
                            router.push(`/profile/${post.originalAuthor}`)
                          }
                        />
                        <span
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() =>
                            post.originalAuthor &&
                            router.push(`/profile/${post.originalAuthor}`)
                          }
                        >
                          @{post.originalAuthor || "Unknown"}
                        </span>
                      </div>
                      <p className="text-foreground">
                        {post.originalPostContent}
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md border-border/30 bg-muted/20 dark:bg-muted/10 p-3 mt-2 text-sm">
                      <p className="text-muted-foreground">
                        The original post content could not be loaded
                      </p>
                    </div>
                  )}
                </div>
              )}
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <Button
              onClick={handleLike}
              variant="ghost"
              className={`flex items-center gap-1 ${
                isLiked ? "text-red-500" : ""
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              {likesCount}
            </Button>

            <Button
              onClick={() => {
                setReplyPrefill(""); // Clear any prefill
                setIsCommentModalOpen(true);
              }}
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
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card
                key={comment.id}
                className="p-4 shadow-md border border-border rounded-lg"
              >
                <CardHeader className="p-0 pb-2">
                  <div className="flex items-center gap-2">
                    <AuthorAvatar
                      username={comment.user?.username || "Anonymous"}
                      size={24}
                      className="cursor-pointer"
                      onClick={() => comment.user && router.push(`/profile/${comment.user.username}`)}
                    />
                    <CardTitle className="text-sm font-medium">
                      {comment.user?.username || "Anonymous"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm mt-1">{comment.content}</p>
                  
                  {/* Comment action buttons */}
                  <div className="mt-2 flex items-center text-xs text-muted-foreground">
                    {/* Like button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-7 px-2 text-xs rounded-full ${likedComments[comment.id] ? "text-red-500" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommentLike(comment.id);
                      }}
                    >
                      <Heart className={`h-3 w-3 mr-1 ${likedComments[comment.id] ? "fill-current" : ""}`} />
                      {commentLikes[comment.id] || 0}
                    </Button>
                    
                    {/* Reply button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs rounded-full ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(comment.user?.username || "Anonymous");
                      }}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              setReplyPrefill(""); // Clear any prefill
              setIsCommentModalOpen(true);
            }}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" /> Add Comment
          </Button>
        </div>
      </div>

      <CommentModal
        postId={post.id}
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setReplyPrefill(""); // Reset prefill on close
        }}
        onCommentAdded={handleCommentAdded}
        prefillText={replyPrefill}
      />
    </div>
  );
};

export default PostDetail;