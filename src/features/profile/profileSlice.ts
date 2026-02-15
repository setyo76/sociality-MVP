import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/api";
import type { User, Post } from "@/types";

interface ProfileState {
  myProfile: User | null;
  publicProfile: User | null;
  userPosts: Post[]; // Posts milik user yang sedang dilihat
  isLoading: boolean;
}

const initialState: ProfileState = {
  myProfile: null,
  publicProfile: null,
  userPosts: [],
  isLoading: false,
};

// Get My Profile (Private)
export const getMyProfile = createAsyncThunk("profile/getMe", async () => {
  const response = await apiClient.get<{ data: User }>("/me");
  return response.data.data;
});

// Update My Profile
export const updateMyProfile = createAsyncThunk(
  "profile/updateMe",
  async (data: FormData) => {
    const response = await apiClient.patch<{ data: User }>("/me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
);

// Get Public Profile
export const getPublicProfile = createAsyncThunk("profile/getPublic", async (username: string) => {
  const response = await apiClient.get<{ data: User }>(`/users/${username}`);
  return response.data.data;
});

// Get Public User's Posts
export const getUserPosts = createAsyncThunk("profile/getUserPosts", async (username: string) => {
  const response = await apiClient.get<{ data: Post[] }>(`/users/${username}/posts`);
  return response.data.data;
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
        if (state.publicProfile?.id === action.payload.id) {
            state.publicProfile = action.payload; // Update juga jika sedang lihat profil sendiri
        }
      })
      .addCase(getPublicProfile.fulfilled, (state, action) => {
        state.publicProfile = action.payload;
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload;
      });
  },
});

export default profileSlice.reducer;