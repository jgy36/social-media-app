// src/components/feed/RepostButton.tsx
import { useState } from "react";
import { Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
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

const RepostButton = ({ postId, author, content, repostsCount = 0 }: RepostButtonProps) => {
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

  const handleRepost = async () => {
    if (!user.token) return;
    
    setIsReposting(true);
    
    try {
      // Format content to include original post reference
      const repostContent = `${repostComment ? `${repostComment}\n\n` : ""}Reposted from @${author}:\n"${content}"`;
      
      // Add reference to original post (for database tracking)
      const postData = {
        content: repostContent,
        originalPostId: postId,
        isRepost: true
      };
      
      // Create the repost
      const result = await createPost(postData);
      
      if (result) {
        toast({
          title: "Success!",
          description: "Post reposted successfully",
          duration: 3000,
        });
        
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
        <span className="ml-1">{repostsCount > 0 ? repostsCount : "Repost"}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Repost this content</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
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
              <p className="text-sm text-muted-foreground">{content}</p>
            </div>
            
            {/* Optional comment */}
            <Textarea
              placeholder="Add a comment (optional)"
              value={repostComment}
              onChange={(e) => setRepostComment(e.target.value)}
              className="min-h-[100px] resize-none"
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