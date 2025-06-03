// src/components/feed/RepostButton.tsx - Updated version
import { useState } from "react";
import { Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import { useCreatePost } from "@/hooks/useApi";

interface RepostButtonProps {
  postId: number;
  author: string;
  content: string;
  repostsCount?: number;
}

const RepostButton = ({
  postId,
  author,
  content,
  repostsCount = 0,
}: RepostButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { execute: createPost } = useCreatePost();

  const handleOpenRepost = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent post navigation

    if (!user.token) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsOpen(true);
  };

  // In RepostButton.tsx, enhance the handleRepost function:

  const handleRepost = async () => {
    if (!user.token) return;

    setIsReposting(true);

    try {
      // Check that post ID is valid
      if (!postId || isNaN(Number(postId)) || postId <= 0) {
        throw new Error("Invalid original post ID");
      }

      // Log debug information with more details
      console.log("🔄 Creating repost for post:", {
        id: postId,
        author: author,
        content:
          content?.substring(0, 30) +
          (content && content.length > 30 ? "..." : ""),
        repostComment: repostComment,
      });

      // Create the repost request using the field name expected by the backend
      const postData = {
        content: repostComment,
        originalPostId: postId,
        repost: true, // Match the field name in the backend
      };

      // Create the repost
      const result = await createPost(postData);
      console.log("🔄 Repost creation result:", result);

      if (result) {
        toast({
          title: "Success!",
          description: "Post reposted successfully",
          duration: 3000,
        });

        // Enhanced refresh mechanism
        // 1. Dispatch custom event as before
        window.dispatchEvent(new CustomEvent("refreshFeed"));

        // 2. Add a fallback refresh after a short delay in case the event doesn't work
        setTimeout(() => {
          console.log("🔄 Executing fallback feed refresh");
          window.dispatchEvent(new CustomEvent("refreshFeed"));
        }, 1000);

        setIsOpen(false);
        setRepostComment("");
      } else {
        toast({
          title: "Error",
          description: "Failed to repost. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reposting:", error);
      toast({
        title: "Error",
        description: "Failed to repost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenRepost}
        className="flex items-center gap-1 rounded-full hover:text-green-500 dark:hover:text-green-400 transition-colors"
      >
        <Repeat className="h-4 w-4" />
        <span className="ml-1">
          {repostsCount > 0 ? repostsCount : "Repost"}
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-background text-foreground">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Repost this content</DialogTitle>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="mt-2">
            {/* Original post preview */}
            <div className="rounded-md border border-border/50 p-3 mb-4">
              <div className="flex items-center mb-2">
                <AuthorAvatar username={author} size={24} />
                <span className="ml-2 font-medium">@{author}</span>
              </div>
              <p className="text-sm text-foreground">{content}</p>
            </div>

            {/* Optional comment with fixed dark mode colors */}
            <Textarea
              placeholder="Add a comment (optional)"
              value={repostComment}
              onChange={(e) => setRepostComment(e.target.value)}
              className="min-h-[100px] resize-none text-foreground dark:text-foreground bg-background dark:bg-background border-input"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isReposting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRepost}
              disabled={isReposting}
              className="flex items-center gap-2"
            >
              {isReposting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Reposting...
                </>
              ) : (
                <>
                  <Repeat className="h-4 w-4" />
                  Repost
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RepostButton;