import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card } from "@/components/ui/card";

// ✅ Define Type for Post
interface Post {
  id: number;
  content: string;
  createdAt: string; // Adding createdAt for sorting
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

const ProfilePosts = () => {
  const user = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<Post[]>([]); // ✅ Explicit Type for State

  useEffect(() => {
    if (user?.id) {
      axios.get(`${API_BASE_URL}/posts/user/${user.id}`)
        .then(response => {
          // ✅ Sort posts by createdAt in descending order (newest first)
          const sortedPosts = [...(response.data as Post[])].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setPosts(sortedPosts);
        })
        .catch(error => console.error("Error fetching posts:", error));
    }
  }, [user?.id]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold">Your Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="p-4 mt-4">
            <p className="text-sm">{post.content}</p>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProfilePosts;