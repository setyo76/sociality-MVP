// src/services/api.ts

import apiClient from "@/lib/api";
import { Post, Profile, PaginatedResponse, Comment } from "@/types";

// ==================== PROFILE SERVICES ====================

export const profileService = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get("/me");
    return response.data;
  },

updateProfile: async (data: FormData): Promise<Profile> => {
  const response = await apiClient.patch("/me", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // Pastikan mengembalikan data yang benar sesuai struktur API Anda
  return response.data.data || response.data;
},

  getUserProfile: async (username: string): Promise<Profile> => {
    const response = await apiClient.get(`/users/${username}`);
    return response.data;
  },
};

// ==================== FEED SERVICES ====================

interface FeedResponse {
  data: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore?: boolean;
}

export const feedService = {
  getFeed: async (page = 1, limit = 10): Promise<FeedResponse> => {
    const response = await apiClient.get("/feed", {
      params: { page, limit },
    });
    console.log("📡 API getFeed response:", response.data);
    
    const data = response.data;
    console.log("📊 Feed data structure:", data);
    
    if (data.data && data.data.items) {
      console.log("🔍 Formatting response:", {
        items: data.data.items.length,
        page: data.data.pagination?.page || page
      });
      
      return {
        data: data.data.items,
        page: data.data.pagination?.page || page,
        limit: data.data.pagination?.limit || limit,
        total: data.data.pagination?.total || 0,
      };
    } else if (data.items) {
      return {
        data: data.items,
        page: data.pagination?.page || page,
        limit: data.pagination?.limit || limit,
        total: data.pagination?.total || 0,
      };
    } else if (Array.isArray(data.data)) {
      return {
        data: data.data,
        page,
        limit,
        total: data.data.length,
      };
    } else if (Array.isArray(data)) {
      return {
        data: data,
        page,
        limit,
        total: data.length,
      };
    }
    
    return {
      data: [],
      page,
      limit,
      total: 0,
    };
  },

  getExplore: async (page = 1, limit = 20): Promise<FeedResponse> => {
    try {
      console.log(`🔍 Calling /posts endpoint (page ${page}, limit ${limit})`);
      
      const response = await apiClient.get("/posts", {
        params: { page, limit },
      });
      
      console.log("📡 API getExplore (/posts) response:", response.data);
      
      const data = response.data;
      
      if (data.data && data.data.posts) {
        const posts = data.data.posts;
        const pagination = data.data.pagination;
        
        console.log(`✅ Explore: received ${posts.length} posts from page ${page}`);
        console.log("📊 Pagination:", pagination);
        
        return {
          data: posts,
          page: pagination?.page || page,
          limit: pagination?.limit || limit,
          total: pagination?.total || 0,
          hasMore: pagination ? (pagination.page < pagination.totalPages) : false
        };
      } else if (data.posts) {
        return {
          data: data.posts,
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || limit,
          total: data.pagination?.total || 0,
          hasMore: data.pagination ? (data.pagination.page < data.pagination.totalPages) : false
        };
      } else if (Array.isArray(data.data)) {
        return {
          data: data.data,
          page,
          limit,
          total: data.data.length,
          hasMore: data.data.length >= limit
        };
      } else if (Array.isArray(data)) {
        return {
          data: data,
          page,
          limit,
          total: data.length,
          hasMore: data.length >= limit
        };
      }
      
      console.warn("⚠️ Unexpected response structure:", data);
      return {
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error("❌ getExplore error:", error);
      return {
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false
      };
    }
  },
};

// ==================== POSTS SERVICES ====================

export const postsService = {
  getFeed: async (page = 1, limit = 10): Promise<FeedResponse> => {
    return feedService.getFeed(page, limit);
  },

  getExplore: async (page = 1, limit = 20): Promise<FeedResponse> => {
    return feedService.getExplore(page, limit);
  },

  createPost: async (data: FormData): Promise<Post> => {
    const response = await apiClient.post("/posts", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  getUserPosts: async (
    username: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`/users/${username}/posts`, {
      params: { page, limit },
    });
    
    if (response.data.data && response.data.data.items) {
      return {
        data: response.data.data.items,
        page: response.data.data.pagination?.currentPage || page,
        limit: response.data.data.pagination?.pageSize || limit,
        total: response.data.data.pagination?.totalItems || 0,
      };
    }
    
    return response.data;
  },

  getMySavedPosts: async (page = 1, limit = 12): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/me/saved", {
      params: { page, limit },
    });
    
    if (response.data.data && response.data.data.items) {
      return {
        data: response.data.data.items,
        page: response.data.data.pagination?.currentPage || page,
        limit: response.data.data.pagination?.pageSize || limit,
        total: response.data.data.pagination?.totalItems || 0,
      };
    }
    
    return response.data;
  },
};

// ==================== LIKES SERVICES ====================

export const likesService = {
  likePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/posts/${postId}/like`);
  },

  unlikePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/like`);
  },

  getPostLikes: async (postId: string): Promise<{ users: User[] }> => {
    const response = await apiClient.get(`/posts/${postId}/likes`);
    return response.data;
  },

  getMyLikedPosts: async (page = 1, limit = 12): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get("/me/likes", {
      params: { page, limit },
    });
    return response.data;
  },
};

// ==================== SAVES SERVICES ====================

export const savesService = {
  savePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/posts/${postId}/save`);
  },

  unsavePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/save`);
  },
};

// ==================== COMMENTS SERVICES ====================

export const commentsService = {
  getComments: async (
    postId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Comment>> => {
    const response = await apiClient.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  },

  addComment: async (postId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};

// ==================== FOLLOW SERVICES ====================

interface User {
  id: number;
  name: string;
  username: string;
  avatar?: string | null;
  avatarUrl?: string | null;
}

export const followService = {
  followUser: async (username: string): Promise<void> => {
    await apiClient.post(`/follow/${username}`);
  },

  unfollowUser: async (username: string): Promise<void> => {
    await apiClient.delete(`/follow/${username}`);
  },

  getFollowers: async (username: string): Promise<{ users: User[] }> => {
    const response = await apiClient.get(`/users/${username}/followers`);
    return response.data;
  },

  getFollowing: async (username: string): Promise<{ users: User[] }> => {
    const response = await apiClient.get(`/users/${username}/following`);
    return response.data;
  },

  getMyFollowers: async (): Promise<{ users: User[] }> => {
    const response = await apiClient.get("/me/followers");
    return response.data;
  },

  getMyFollowing: async (): Promise<{ users: User[] }> => {
    const response = await apiClient.get("/me/following");
    return response.data;
  },
};

// ==================== SEARCH SERVICES ====================

interface SearchResponse {
  users: User[];
}

export const searchService = {
  searchUsers: async (query: string): Promise<SearchResponse> => {
    try {
      console.log("🔍 Searching users with query:", query);
      
      const response = await apiClient.get("/users/search", {
        params: { q: query },
      });
      
      console.log("📡 Search API response:", response.data);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data.users)) {
        return { users: data.data.users };
      } else if (Array.isArray(data.users)) {
        return { users: data.users };
      } else if (data.data && Array.isArray(data.data)) {
        return { users: data.data };
      } else if (Array.isArray(data)) {
        return { users: data };
      }
      
      return { users: [] };
    } catch (error) {
      console.error("❌ Search error:", error);
      return { users: [] };
    }
  },
};