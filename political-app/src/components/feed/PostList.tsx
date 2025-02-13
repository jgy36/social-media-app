import { useEffect, useState } from "react";
import Post from "./Post";
import { PostType } from "@/types/post";
import { fetchPosts } from "@/utils/api"; // ✅ Ensure correct API call

// ✅ Define the expected props for filtering posts
interface PostListProps {
  activeTab: "for-you" | "following";
}

const PostList: React.FC<PostListProps> = ({ activeTab }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const data = await fetchPosts();
      setPosts(data);
      setLoading(false);
    };

    loadPosts();
  }, []);

  // ✅ Filter posts based on tab selection
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "following") {
      return post.following; // ✅ Ensure your backend provides `following` field
    }
    return true; // Show all posts for "For You" tab
  });

  if (loading) return <p>Loading posts...</p>;
  if (filteredPosts.length === 0) return <p>No posts available.</p>;

  return (
    <div>
      {filteredPosts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
