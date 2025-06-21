// src/redux/slices/postSlice.ts - React Native (no changes needed)
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PostType } from "@/types/post";

interface PostState {
  posts: PostType[];
}

const initialState: PostState = {
  posts: [],
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostType[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<PostType>) => {
      state.posts.unshift(action.payload); // ✅ Add new post at the top
    },
  },
});

export const { setPosts, addPost } = postSlice.actions;
export default postSlice.reducer;