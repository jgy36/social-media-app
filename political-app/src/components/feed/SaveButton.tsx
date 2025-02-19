import { useState } from "react";
import { savePost } from "@/utils/api";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface SaveButtonProps {
  postId: number;
  isSaved: boolean;
}

const SaveButton = ({ postId, isSaved }: SaveButtonProps) => {
  const [saved, setSaved] = useState(isSaved);
  const user = useSelector((state: RootState) => state.user);

  const handleSave = async () => {
    if (!user.token) return;
    try {
      await savePost(postId);
      setSaved(!saved);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSave}
      className={`flex items-center gap-1 ${saved ? "text-yellow-500" : ""}`}
    >
      <Bookmark className="h-4 w-4" />
      {saved ? "Saved" : "Save"}
    </Button>
  );
};

export default SaveButton;
