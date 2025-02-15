import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // ✅ Handles authentication state
import postReducer from "./slices/postSlice"; // ✅ Handles posts state

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer,
  },
});

// ✅ Export RootState & AppDispatch types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
