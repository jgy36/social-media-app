import { useState } from "react";
import { createPost } from "@/utils/api"; // ✅ Uses the correct API function
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const PostForm = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user); // ✅ Get user from Redux

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.token) {
      setError("You must be logged in to post.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost({ content }, user.token); // ✅ API now handles the user
      setContent(""); // ✅ Clear input after posting
      onPostCreated(); // ✅ Refresh post list
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
