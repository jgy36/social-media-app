// src/components/feed/SaveButton.tsx
import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/router";
import { toast } from "@/hooks/use-toast";
import { useSavePost, useCheckPostSaveStatus } from "@/hooks/useApi"; // Import API hooks

interface SaveButtonProps {
  postId: number;
  isSaved: boolean;
}

const SaveButton = ({ postId, isSaved: initialIsSaved }: SaveButtonProps) => {
  const [saved, setSaved] = useState(initialIsSaved);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Use API hooks
  const { loading: saveLoading, execute: savePost } = useSavePost();
  const { data: savedStatus } = useCheckPostSaveStatus();

  // Check the actual saved status when component mounts
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!user.token) return;
      
      try {
        if (typeof savedStatus === "function") {
          const status = await savedStatus(postId);
          if (status) {
            setSaved(status.isSaved);
          }
        } else {
          console.error("savedStatus is not a function or is null");
          setSaved(initialIsSaved);
        }
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
  }, [postId, user.token, initialIsSaved, savedStatus]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering post navigation
    
    if (!user.token) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    try {
      // Use the API hook to save/unsave post
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
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSave}
      disabled={saveLoading}
      className={`flex items-center gap-1 ${saved ? "text-yellow-500" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saveLoading ? "Saving..." : saved ? "Saved" : "Save"}
    </Button>
  );
};

export default SaveButton;