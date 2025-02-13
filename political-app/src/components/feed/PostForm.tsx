import { useState } from "react";
import api from "@/utils/api"; // ✅ Import pre-configured Axios instance
import { PostType } from "@/types/post";

const PostForm = ({
  onPostCreated,
}: {
  onPostCreated: (post: PostType) => void;
}) => {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState(""); // In a real app, fetch from auth state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<PostType>("/posts", {
        content,
        username,
      });
      onPostCreated(response.data);
      setContent(""); // Clear input after posting
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Create a Post</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
