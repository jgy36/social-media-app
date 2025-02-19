import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/utils/api"; // ✅ Token is automatically included

interface CommentModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

const CommentModal = ({ postId, isOpen, onClose }: CommentModalProps) => {
  const [content, setContent] = useState("");

  const handleComment = async () => {
    if (!content.trim()) return;

    try {
      await addComment(postId, content); // ✅ No need to pass user.token
      setContent("");
      onClose(); // Close modal after comment
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a comment</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your comment..."
        />
        <Button onClick={handleComment} className="mt-3 w-full">
          Post Comment
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CommentModal;
