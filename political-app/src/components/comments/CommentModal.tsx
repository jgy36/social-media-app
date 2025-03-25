import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/api/posts"; // Update import
import { Loader2 } from "lucide-react";

interface CommentModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void; // Add optional callback for when comment is added
}

const CommentModal = ({ postId, isOpen, onClose, onCommentAdded }: CommentModalProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComment = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addComment(postId, content);
      setContent("");
      
      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded();
      } else {
        onClose(); // Only close if no callback provided
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a comment</DialogTitle>
        </DialogHeader>
        
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
        
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your comment..."
          disabled={isSubmitting}
          className="min-h-[100px]"
        />
        
        <Button 
          onClick={handleComment} 
          className="mt-3 w-full"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Comment"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;