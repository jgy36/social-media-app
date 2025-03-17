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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = useSelector((state: RootState) => state.user.token);

  useEffect(() => {
    if (!token && activeTab === "following") {
      console.warn("No auth token found! Redirecting to landing page...");
      router.push("/"); // ✅ Redirects to landing page if no token
      return;
    }

    const loadPosts = async () => {
      // If we're already on "following" tab with no auth, just return early without setting loading
      if (!token && activeTab === "following") return;

      setLoading(true);
      setError(null);
      
      // Properly format endpoints with leading slash
      const endpoint =
        activeTab === "for-you" ? "/posts/for-you" : "/posts/following";

      try {
        console.log(`Fetching posts from endpoint: ${endpoint}`);
        const data = await fetchPosts(endpoint);
        setPosts(data);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [activeTab, token, router]);

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => router.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!token && activeTab === "following") return null; // ✅ Prevent rendering before redirecting
  if (loading) return <p className="p-4 text-center">Loading posts...</p>;
  if (posts.length === 0) return <p className="p-4 text-center">No posts available.</p>;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;