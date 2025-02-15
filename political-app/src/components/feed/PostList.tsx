import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchPosts } from "@/utils/api";
import Post from "./Post";
import { PostType } from "@/types/post";

interface PostListProps {
  activeTab: "for-you" | "following";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token); // ✅ Get token from Redux

  useEffect(() => {
    if (!token && activeTab === "following") {
      console.warn("No auth token found! Redirecting to landing page...");
      router.push("/"); // ✅ Redirects to landing page if no token
      return;
    }

    const loadPosts = async () => {
      if (!token && activeTab === "following") return; // ✅ Prevent API call if no token

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
  }, [activeTab, token, router]); // ✅ Ensures hooks are called in the correct order

  if (!token && activeTab === "following") return null; // ✅ Prevent rendering before redirecting
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
