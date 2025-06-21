import { useState } from "react";
import { Share2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  postId: number;
  sharesCount?: number; // Optional to prevent errors
}

const ShareButton = ({ postId, sharesCount = 0 }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
      duration: 2000,
    });
    
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }} 
        className="flex items-center gap-1 rounded-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="ml-1">{sharesCount > 0 ? sharesCount : "Share"}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-card/95 border border-border/40 dark:border-border/20">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Share Post</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Share this post with others by copying the link below
            </p>
            
            <div className="flex items-center space-x-2">
              <div className="bg-muted p-2 rounded-md flex-1 overflow-hidden text-ellipsis text-sm">
                {`${window.location.origin}/post/${postId}`}
              </div>
              <Button 
                onClick={handleCopyLink} 
                className="flex items-center gap-2"
                variant="default"
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
            
            <div className="flex justify-center gap-3 mt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/post/${postId}`, '_blank');
                }}
              >
                Twitter
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/post/${postId}`, '_blank');
                }}
              >
                Facebook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;