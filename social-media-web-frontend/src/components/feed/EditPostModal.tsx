import { useState, useEffect } from "react";
import { updatePost } from "@/api/posts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface EditPostModalProps {
  postId: number;
  initialContent: string;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  postId,
  initialContent,
  isOpen,
  onClose,
  onPostUpdated,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Reset content when modal opens with new initialContent
    if (isOpen) {
      setContent(initialContent);
    }
  }, [isOpen, initialContent]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updatePost(postId, content);
      
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit Post</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="mt-2">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none text-foreground dark:text-foreground bg-background dark:bg-background border-input"
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;