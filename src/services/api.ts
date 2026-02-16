// src/services/api.ts

import apiClient from "@/lib/api";
import { Post, Profile, PaginatedResponse, Comment } from "@/types";

// ==================== INTERFACES ====================

interface User {
  id: number;
  name: string;
  username: string;
  avatar?: string | null;
  avatarUrl?: string | null;
}

interface FeedResponse {
  data: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore?: boolean;
}

// ==================== PROFILE SERVICES ====================

export const profileService = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get("/me");
    return response.data.data || response.data;
  },

  updateProfile: async (data: FormData): Promise<Profile> => {
    const response = await apiClient.patch("/me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data;
  },

  // Fungsi baru untuk halaman [username]
  getProfileByUsername: async (username: string): Promise<Profile> => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data.data || response.data;
  },

  getUserProfile: async (username: string): Promise<Profile> => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data.data || response.data;
  },
};

// ==================== FEED & POSTS SERVICES ====================

export const feedService = {
  getFeed: async (page = 1, limit = 10): Promise<FeedResponse> => {
    const response = await apiClient.get("/feed", { params: { page, limit } });
    const data = response.data;

    // Handle nested response structures
    const items = data.data?.items || data.items || (Array.isArray(data.data) ? data.data : data);
    const pagination = data.data?.pagination || data.pagination;

    return {
      data: Array.isArray(items) ? items : [],
      page: pagination?.page || page,
      limit: pagination?.limit || limit,
      total: pagination?.total || 0,
    };
  },

  getExplore: async (page = 1, limit = 20): Promise<FeedResponse> => {
    try {
      const response = await apiClient.get("/posts", { params: { page, limit } });
      const data = response.data;

      const posts = data.data?.posts || data.posts || (Array.isArray(data.data) ? data.data : data);
      const pagination = data.data?.pagination || data.pagination;

      return {
        data: Array.isArray(posts) ? posts : [],
        page: pagination?.page || page,
        limit: pagination?.limit || limit,
        total: pagination?.total || 0,
        hasMore: pagination ? pagination.page < pagination.totalPages : (posts.length >= limit)
      };
    } catch (error) {
      console.error("❌ getExplore error:", error);
      return { data: [], page, limit, total: 0, hasMore: false };
    }
  },
};

export const postsService = {
  getFeed: (page = 1, limit = 10) => feedService.getFeed(page, limit),
  getExplore: (page = 1, limit = 20) => feedService.getExplore(page, limit),

  createPost: async (data: FormData): Promise<Post> => {
    const response = await apiClient.post("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data.data || response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  getUserPosts: async (username: string, page = 1, limit = 12): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`/users/${username}/posts`, {
      params: { page, limit },
    });
    const data = response.data;
    
    return {
      data: data.data?.items || data.items || data.data || [],
      page: data.data?.pagination?.currentPage || page,
      limit: data.data?.pagination?.pageSize || limit,
      total: data.data?.pagination?.totalItems || 0,
    };
  },

  getMySavedPosts: async (page = 1, limit = 12): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/me/saved", { params: { page, limit } });
    const data = response.data;
    return {
      data: data.data?.items || data.items || data.data || [],
      page: data.data?.pagination?.currentPage || page,
      limit: data.data?.pagination?.pageSize || limit,
      total: data.data?.pagination?.totalItems || 0,
    };
  },
};

// ==================== LIKES & SAVES SERVICES ====================

export const likesService = {
  likePost: (postId: string) => apiClient.post(`/posts/${postId}/like`),
  unlikePost: (postId: string) => apiClient.delete(`/posts/${postId}/like`),
  getPostLikes: async (postId: string) => {
    const res = await apiClient.get(`/posts/${postId}/likes`);
    return res.data.data || res.data;
  },
  getMyLikedPosts: async (page = 1, limit = 12) => {
    const res = await apiClient.get("/me/likes", { params: { page, limit } });
    return res.data.data || res.data;
  }
};

export const savesService = {
  savePost: (postId: string) => apiClient.post(`/posts/${postId}/save`),
  unsavePost: (postId: string) => apiClient.delete(`/posts/${postId}/save`),
};

// ==================== COMMENTS SERVICES ====================

export const commentsService = {
  getComments: async (postId: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data.data || response.data;
  },

  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content });
    return response.data.data || response.data;
  },

  deleteComment: (commentId: string) => apiClient.delete(`/comments/${commentId}`),
};

// ==================== FOLLOW SERVICES ====================

export const followService = {
  followUser: (username: string) => apiClient.post(`/follow/${username}`),
  unfollowUser: (username: string) => apiClient.delete(`/follow/${username}`),
  getFollowers: async (username: string) => {
    const res = await apiClient.get(`/users/${username}/followers`);
    return res.data.data || res.data;
  },
  getFollowing: async (username: string) => {
    const res = await apiClient.get(`/users/${username}/following`);
    return res.data.data || res.data;
  },
};

// ==================== SEARCH SERVICES ====================

export const searchService = {
  searchUsers: async (query: string): Promise<{ users: User[] }> => {
    try {
      const response = await apiClient.get("/users/search", { params: { q: query } });
      const data = response.data;
      const users = data.data?.users || data.users || data.data || data;
      return { users: Array.isArray(users) ? users : [] };
    } catch (error) {
      console.error("❌ Search error:", error);
      return { users: [] };
    }
  },
};