// src/store/slices/postsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { postsService } from "@/services/api";
import { Post } from "@/types";


interface PostsState {
  feed: Post[];
  explore: Post[];
  isLoadingFeed: boolean;
  isLoadingExplore: boolean;
  feedPage: number;
  explorePage: number;
  feedHasMore: boolean;
  exploreHasMore: boolean;
  error: string | null;
}

const initialState: PostsState = {
  feed: [],
  explore: [],
  isLoadingFeed: false,
  isLoadingExplore: false,
  feedPage: 1,
  explorePage: 1,
  feedHasMore: true,
  exploreHasMore: true,
  error: null,
};

export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async (page: number, { rejectWithValue }) => {
    try {
      const response = await postsService.getFeed(page, 10);
      console.log("✅ fetchFeed received:", response);
      return { ...response, page };
    } catch (error: any) {
      console.error("❌ fetchFeed error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch feed");
    }
  }
);

export const fetchExplore = createAsyncThunk(
  "posts/fetchExplore",
  async (page: number, { rejectWithValue }) => {
    try {
      console.log("🔍 [fetchExplore] Starting request for page:", page);
      const response = await postsService.getExplore(page, 10);
      console.log("✅ [fetchExplore] received:", response);
      
      const posts = Array.isArray(response.data) ? response.data : [];
      
      console.log(`📦 Page ${page}: received ${posts.length} posts`);
      
      return { 
        data: posts, 
        page: response.page || page,
        total: response.total || 0,
        hasMore: posts.length === 10 || response.hasMore
      };
    } catch (error: any) {
      console.error("❌ fetchExplore error:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch explore");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearFeed: (state) => {
      state.feed = [];
      state.feedPage = 1;
      state.feedHasMore = true;
    },
    clearExplore: (state) => {
      state.explore = [];
      state.explorePage = 1;
      state.exploreHasMore = true;
    },
    updatePostInFeed: (state, action: PayloadAction<Post>) => {
      // Update in feed
      const feedIndex = state.feed.findIndex((p) => p.id === action.payload.id);
      if (feedIndex !== -1) {
        state.feed[feedIndex] = action.payload;
      }
      
      // Update in explore
      const exploreIndex = state.explore.findIndex((p) => p.id === action.payload.id);
      if (exploreIndex !== -1) {
        state.explore[exploreIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Feed
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoadingFeed = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action: any) => {
        state.isLoadingFeed = false;

        const response = action.payload;
        const page = response.page;
        
        // LANGSUNG ambil response.data karena sudah diformat di api.ts
        let posts: Post[] = response.data || [];
        
        console.log("✅ Feed posts page", page, ":", posts.length, "items");

        if (page === 1) {
          state.feed = posts;
        } else {
          // Hindari duplikasi
          const newPosts = posts.filter(
            (newPost) => !state.feed.some((existingPost) => existingPost.id === newPost.id)
          );
          state.feed = [...state.feed, ...newPosts];
        }

        state.feedPage = page;
        state.feedHasMore = posts.length >= 10;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoadingFeed = false;
        state.error = action.payload as string || "Failed to fetch feed";
      });

    // Explore
    builder
      .addCase(fetchExplore.pending, (state) => {
        state.isLoadingExplore = true;
        state.error = null;
      })
      .addCase(fetchExplore.fulfilled, (state, action: any) => {
        state.isLoadingExplore = false;
        
        const posts = action.payload.data || [];
        const page = action.payload.page;
        
        console.log(`✅ Explore posts page ${page}:`, posts.length, "items");
        
        // Log semua posts untuk debugging
        if (posts.length > 0) {
          console.log('📊 All explore posts:', posts.map((p: Post) => ({
            id: p.id,
            author: p.author?.name,
            authorUsername: p.author?.username
          })));
        } else {
          console.warn('⚠️ No explore posts received');
        }
        
        if (page === 1) {
          state.explore = posts;
        } else {
          // Hindari duplikasi
          const newPosts = posts.filter(
            (newPost: any) => !state.explore.some((existingPost) => existingPost.id === newPost.id)
          );
          state.explore = [...state.explore, ...newPosts];
        }
        
        state.explorePage = page;
        state.exploreHasMore = action.payload.hasMore;
      })
      .addCase(fetchExplore.rejected, (state, action) => {
        state.isLoadingExplore = false;
        state.error = action.payload as string || "Failed to fetch explore";
        console.error('❌ fetchExplore rejected:', action.payload);
      });
  },
});

export const { clearFeed, clearExplore, updatePostInFeed } = postsSlice.actions;
export default postsSlice.reducer;