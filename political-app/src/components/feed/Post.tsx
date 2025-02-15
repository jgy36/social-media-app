import { useState } from "react";
import { PostType } from "@/types/post";
import { likePost } from "@/utils/api"; // ✅ Import likePost function

interface PostProps {
  post: PostType;
}

const Post = ({ post }: PostProps) => {
  const [likes, setLikes] = useState(post.likes); // Track likes locally
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return; // Prevent multiple clicks
    setIsLiking(true);

    try {
      await likePost(post.id);
      setLikes((prevLikes) => prevLikes + 1);
    } catch (error) {
      console.error("Error liking post:", error);
    }

    setIsLiking(false);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800">
      <h3 className="font-semibold">{post.author}</h3>
      <p>{post.content}</p>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleLike}
          className="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          disabled={isLiking}
        >
          {isLiking ? "Liking..." : "Like"}
        </button>
        <span>{likes} Likes</span>
      </div>
    </div>
  );
};

export default Post;
