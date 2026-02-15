import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";
import type { Post } from "@/types";

interface PostsState {
  feed: Post[];
  feedPage: number;
  hasMoreFeed: boolean;
  isLoadingFeed: boolean;
  singlePost: Post | null; // Untuk detail page
  isLoadingAction: boolean; // Untuk create/delete
}

const initialState: PostsState = {
  feed: [],
  feedPage: 1,
  hasMoreFeed: true,
  isLoadingFeed: false,
  singlePost: null,
  isLoadingAction: false,
};

// 1. Get Feed (Private Timeline)
export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async (page: number = 1) => {
    const response = await apiClient.get<{ data: Post[] }>("/feed", { params: { page, limit: 10 } });
    return { data: response.data.data, page };
  }
);

// 2. Create Post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (formData: FormData) => {
    // FormData karena ada file image
    const response = await apiClient.post<{ data: Post }>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
);

// 3. Delete Post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string) => {
    await apiClient.delete(`/posts/${postId}`);
    return postId;
  }
);

// 4. Get Post Detail (untuk halaman detail dan komentar)
export const fetchPostDetail = createAsyncThunk(
  "posts/fetchDetail",
  async (postId: string) => {
    const response = await apiClient.get<{ data: Post }>(`/posts/${postId}`);
    return response.data.data;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    resetFeed: (state) => {
      state.feed = [];
      state.feedPage = 1;
      state.hasMoreFeed = true;
    },
  },
  extraReducers: (builder) => {
    // Feed
    builder.addCase(fetchFeed.pending, (state) => { state.isLoadingFeed = true; })
    .addCase(fetchFeed.fulfilled, (state, action) => {
      state.isLoadingFeed = false;
      if (action.payload.page === 1) {
        state.feed = action.payload.data;
      } else {
        state.feed = [...state.feed, ...action.payload.data];
      }
      // Cek pagination logic sederhana (jika data kurang dari limit, asumsi habis)
      if (action.payload.data.length < 10) {
        state.hasMoreFeed = false;
      }
    });
    
    // Create Post
    builder.addCase(createPost.pending, (state) => { state.isLoadingAction = true; })
    .addCase(createPost.fulfilled, (state, action) => {
      state.isLoadingAction = false;
      state.feed.unshift(action.payload); // Tambah post baru di paling atas feed
    });

    // Delete Post
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.feed = state.feed.filter((p) => p.id !== action.payload);
    });

    // Post Detail
    builder.addCase(fetchPostDetail.fulfilled, (state, action) => {
      state.singlePost = action.payload;
    });
  },
});

export const { resetFeed } = postsSlice.actions;
export default postsSlice.reducer;