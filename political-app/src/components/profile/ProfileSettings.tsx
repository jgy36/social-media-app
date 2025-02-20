import { useEffect, useState } from "react";
import { getSavedPosts } from "@/utils/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Post from "@/components/feed/Post";
import { PostType } from "@/types/post";

interface ProfileSettingsProps {
  onLogout: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onLogout }) => {
  const user = useSelector((state: RootState) => state.user);
  const [savedPosts, setSavedPosts] = useState<PostType[]>([]);

  useEffect(() => {
    if (user.token) {
      getSavedPosts(user.token).then(setSavedPosts);
    }
  }, [user.token]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold">Settings</h2>

      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>

      {/* ✅ Saved Posts */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">Saved Posts</h2>
        {savedPosts.length === 0 ? (
          <p>No saved posts yet.</p>
        ) : (
          savedPosts.map((post) => <Post key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
