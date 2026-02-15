import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";
import type { Comment } from "@/types";

interface SocialState {
  // Kita bisa menyimpan status per post di sini atau update langsung di slice posts
  // Untuk simplifikasi MVP, kita akan handle update state di reducers posts/profile
  // tapi endpoint calls ada di sini.
}

export const toggleLike = createAsyncThunk(
  "social/toggleLike",
  async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
    if (isLiked) {
      await apiClient.delete(`/posts/${postId}/like`); // Unlike
      return { postId, type: 'unlike' };
    } else {
      await apiClient.post(`/posts/${postId}/like`); // Like
      return { postId, type: 'like' };
    }
  }
);

export const toggleSave = createAsyncThunk(
  "social/toggleSave",
  async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
    if (isSaved) {
      await apiClient.delete(`/posts/${postId}/save`);
      return { postId, type: 'unsave' };
    } else {
      await apiClient.post(`/posts/${postId}/save`);
      return { postId, type: 'save' };
    }
  }
);

export const toggleFollow = createAsyncThunk(
  "social/toggleFollow",
  async ({ username, isFollowing }: { username: string; isFollowing: boolean }) => {
    if (isFollowing) {
      await apiClient.delete(`/follow/${username}`);
      return { username, type: 'unfollow' };
    } else {
      await apiClient.post(`/follow/${username}`);
      return { username, type: 'follow' };
    }
  }
);

export const fetchComments = createAsyncThunk(
  "social/fetchComments",
  async (postId: string) => {
    const response = await apiClient.get<{ data: Comment[] }>(`/posts/${postId}/comments`);
    return response.data.data;
  }
);

export const createComment = createAsyncThunk(
  "social/createComment",
  async ({ postId, content }: { postId: string; content: string }) => {
    const response = await apiClient.post<{ data: Comment }>(`/posts/${postId}/comments`, { content });
    return { postId, comment: response.data.data };
  }
);

export const deleteComment = createAsyncThunk(
  "social/deleteComment",
  async ({ postId, commentId }: { postId: string; commentId: string }) => {
    await apiClient.delete(`/comments/${commentId}`);
    return { postId, commentId };
  }
);

const socialSlice = createSlice({
  name: "social",
  initialState: {},
  reducers: {},
  // Untuk optimisasi UI (Optimistic Updates), kita perlu menghandle pending/fulfilled
  // Namun untuk MVP ini, kita biarkan reducer di postsSlice atau profileSlice
  // yang menangani update counter berdasarkan action fulfilled di sini.
  extraReducers: (builder) => {
    // Contoh: Update likesCount di Feed saat like berhasil
    builder.addCase(toggleLike.fulfilled, (state, action) => {
      // Logic update global bisa rumit jika data terpisah.
      // Best Practice: Gunakan Normalisasi data atau Update UI langsung via Component
      // lalu sinkronisasi. Untuk MVP, kita biarkan Component yang melakukan re-fetch
      // atau manual update dispatch.
    });
  },
});

export default socialSlice.reducer;