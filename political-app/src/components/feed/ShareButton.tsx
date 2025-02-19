import { useState } from "react";
import { sharePost } from "@/utils/api";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ShareButtonProps {
  postId: number;
  sharesCount: number;
}

const ShareButton = ({ postId, sharesCount }: ShareButtonProps) => {
  const [shares, setShares] = useState(sharesCount);
  const user = useSelector((state: RootState) => state.user);

  const handleShare = async () => {
    if (!user.token) return;
    try {
      await sharePost(postId);
      setShares((prev) => prev + 1);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleShare}
      className="flex items-center gap-1 hover:text-green-500 transition-all"
    >
      <Share2 className="h-4 w-4" />
      {shares}
    </Button>
  );
};

export default ShareButton;
