import { useState } from "react";
import { PostType } from "@/types/post";
import { likePost } from "@/utils/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"; // ✅ Social Icons
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  const user = useSelector((state: RootState) => state.user);
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState(post.comments || 0);
  const [shares, setShares] = useState(post.shares || 0);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    if (isLiking || !user.token) return;
    setIsLiking(true);

    try {
      const updatedData = await likePost(post.id);
      if (updatedData && updatedData.likesCount !== undefined) {
        setLikes(updatedData.likesCount);
        console.log(
          `✅ Post ${post.id} updated: ${updatedData.likesCount} likes`
        ); // ✅ Log success
      } else {
        console.warn("⚠️ Unexpected response structure:", updatedData);
      }
    } catch (error) {
      console.error("❌ Error liking post:", error);
    }

    setIsLiking(false);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  return (
    <Card className="p-4 shadow-md border border-border transition-all hover:shadow-lg">
      {/* ✅ Post Author & Content */}
      <div>
        <h3 className="font-semibold text-lg">{post.author}</h3>
        <p className="text-sm text-muted-foreground">{post.content}</p>
      </div>

      {/* ✅ Post Actions */}
      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
        {/* 🔥 Like Button */}
        <Button
          variant="ghost"
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1 hover:text-red-500 transition-all"
        >
          {isLiking ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
          {likes}
        </Button>

        {/* 💬 Comment Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:text-blue-500 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          {comments}
        </Button>

        {/* 🔁 Share Button */}
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:text-green-500 transition-all"
        >
          <Share2 className="h-4 w-4" />
          {shares}
        </Button>

        {/* 🔖 Save Button */}
        <Button
          variant="ghost"
          onClick={handleSave}
          className={`flex items-center gap-1 transition-all ${
            saved ? "text-yellow-500" : ""
          }`}
        >
          <Bookmark className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
};

export default Post;
