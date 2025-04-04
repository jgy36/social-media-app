// src/components/feed/SaveButton.tsx
import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";
import { savePost, checkPostSaveStatus } from "@/api/posts"; // Import directly from posts api

interface SaveButtonProps {
  postId: number;
  isSaved: boolean;
}

const SaveButton = ({ postId, isSaved: initialIsSaved }: SaveButtonProps) => {
  const [saved, setSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Check the actual saved status when component mounts
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!user.token) return;
      
      try {
        // Use direct API call instead of hook
        const status = await checkPostSaveStatus(postId);
        // Update the saved state based on the server response
        if (status) {
          setSaved(status.isSaved);
        }
      } catch (err) {
        console.error("Error checking save status:", err);
        // If there's an error, fall back to the prop value
        setSaved(initialIsSaved);
      }
    };
    
    // Only check saved status if user is logged in
    if (user.token) {
      fetchSavedStatus();
    }
  }, [postId, user.token, initialIsSaved]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering post navigation
    setIsLoading(true);
    
    if (!user.token) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      setIsLoading(false);
      return;
    }
    
    try {
      // Use direct API call
      await savePost(postId);
      
      // Toggle saved state
      const newSavedState = !saved;
      setSaved(newSavedState);
      
      // Show toast notification
      toast({
        title: newSavedState ? "Post saved successfully" : "Post removed from saved items",
        description: newSavedState 
          ? "You can view your saved posts in your profile menu." 
          : "The post has been removed from your saved items.",
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
      size="sm"
      onClick={handleSave}
      disabled={isLoading}
      className={`flex items-center gap-1 rounded-full ${saved ? "text-yellow-500 dark:text-yellow-400" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      <span className="ml-1">{isLoading ? "Saving..." : saved ? "Saved" : "Save"}</span>
    </Button>
  );
};

export default SaveButton;