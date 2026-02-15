// src/types/index.ts

export interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string | null;
  bio?: string;
}

export interface Author {
  id: number;
  username: string;
  name: string;
  avatar?: string | null;
}

export interface Post {
  id: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

export interface Profile {
  id: number;
  username: string;
  name: string;
  avatar?: string | null;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}