// src/components/feed/PostForm.tsx
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useCreatePost } from "@/hooks/useApi"; // Import the API hook

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.user);
  const { loading, error, execute: createPost } = useCreatePost(); // Use the API hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setLocalError("Post content cannot be empty");
      return;
    }
    
    if (!user.token) {
      setLocalError("You must be logged in to post.");
      return;
    }

    setLocalError(null);

    try {
      // Use the API hook to create post
      const result = await createPost({ content });
      
      if (result) {
        setContent(""); // Clear input after posting
        onPostCreated(); // Notify parent component
      } else {
        setLocalError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setLocalError("Failed to create post. Please try again.");
    }
  };

  // Use either local error or API error
  const errorMessage = localError || (error ? error.message : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px] resize-none"
        disabled={loading}
        required
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !content.trim()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;