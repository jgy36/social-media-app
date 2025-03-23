// src/components/feed/SaveButton.tsx
import { useState } from "react";
import { savePost } from "@/utils/api";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";

interface SaveButtonProps {
  postId: number;
  isSaved: boolean;
}

const SaveButton = ({ postId, isSaved }: SaveButtonProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering post navigation
    
    if (!user.token) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await savePost(postId);
      
      // Toggle saved state
      setSaved(!saved);
      
      // Show toast notification
      toast({
        title: saved ? "Post removed from saved items" : "Post saved successfully",
        description: saved 
          ? "The post has been removed from your saved items." 
          : "You can view your saved posts in your profile menu.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: "Failed to save the post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSave}
      disabled={isLoading}
      className={`flex items-center gap-1 ${saved ? "text-yellow-500" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {isLoading ? "Saving..." : saved ? "Saved" : "Save"}
    </Button>
  );
};

export default SaveButton;