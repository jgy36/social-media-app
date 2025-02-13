import axios from "axios";
import type { PostType } from "@/types/post";

// ✅ Set base URL (Modify if backend runs on a different port)
const API_BASE_URL = "http://localhost:8080/api";

// ✅ Fetch all posts (Public)
export const fetchPosts = async (): Promise<PostType[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    return response.data as PostType[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

// ✅ Create a new post (Requires Auth Token)
export const createPost = async (
  postData: { content: string; username: string },
  token: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as PostType;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// ✅ Fetch a single post by ID (Public)
export const fetchPostById = async (id: number): Promise<PostType | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
    return response.data as PostType;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
};
