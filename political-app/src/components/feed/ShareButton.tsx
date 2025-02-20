import { useState } from "react";
import { Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShareButtonProps {
  postId: number;
  sharesCount?: number; // ✅ Make it optional to prevent errors
}


const ShareButton = ({ postId }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(postUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)} className="flex items-center gap-1">
        <Share2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <Button onClick={handleCopyLink} className="w-full flex items-center gap-2">
            <Copy className="h-4 w-4" /> Copy Link
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButton;
