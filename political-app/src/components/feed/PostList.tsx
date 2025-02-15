import { useEffect, useState } from "react";
import Post from "./Post";
import { PostType } from "@/types/post";
import { fetchPosts } from "@/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface PostListProps {
  activeTab: "for-you" | "following";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = useSelector((state: RootState) => state.user.token); // ✅ Get token from Redux

  useEffect(() => {
    const loadPosts = async () => {
      if (!token && activeTab === "following") return; // ✅ Prevent fetching "following" posts without authentication

      setLoading(true);
      const endpoint =
        activeTab === "for-you" ? "posts/for-you" : "posts/following";
      try {
        const data = await fetchPosts(endpoint);
        setPosts(data);
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
      setLoading(false);
    };

    loadPosts();
  }, [activeTab, token]); // ✅ Re-fetch when tab or token changes

  if (!token && activeTab === "following")
    return <p>Please log in to see posts from people you follow.</p>;
  if (loading) return <p>Loading posts...</p>;
  if (posts.length === 0) return <p>No posts available.</p>;

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
