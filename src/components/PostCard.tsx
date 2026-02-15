"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { likesService, savesService } from "@/services/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string, isLiked: boolean) => void;
  onSaveToggle?: (postId: string, isSaved: boolean) => void;
}

export default function PostCard({ post, onLikeToggle, onSaveToggle }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle Like Toggle (Optimistic UI + Idempotent)
  const handleLikeToggle = async () => {
    if (isLiking) return; // Prevent double-click

    const previousState = isLiked;
    const previousCount = likesCount;

    try {
      setIsLiking(true);

      // Optimistic update
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      // API call
      if (isLiked) {
        await likesService.unlikePost(post.id);
      } else {
        await likesService.likePost(post.id);
      }

      // Callback to parent
      onLikeToggle?.(post.id, !isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic update on error
      setIsLiked(previousState);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Save Toggle (Optimistic UI + Idempotent)
  const handleSaveToggle = async () => {
    if (isSaving) return; // Prevent double-click

    const previousState = isSaved;

    try {
      setIsSaving(true);

      // Optimistic update
      setIsSaved(!isSaved);

      // API call
      if (isSaved) {
        await savesService.unsavePost(post.id);
      } else {
        await savesService.savePost(post.id);
      }

      // Callback to parent
      onSaveToggle?.(post.id, !isSaved);
    } catch (error) {
      console.error("Error toggling save:", error);
      // Revert optimistic update on error
      setIsSaved(previousState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 backdrop-blur-sm">
      {/* Header: User Info */}
      <div className="flex items-center gap-3 p-4">
        <Link href={`/profile/${post.user?.username}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {post.user?.avatar ? (
              <Image
                src={post.user.avatar}
                alt={post.user.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {post.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        </Link>

        <div className="flex-1">
          <Link href={`/profile/${post.user?.username}`}>
            <h3 className="text-white font-semibold text-sm hover:underline">
              {post.user?.name || "Unknown User"}
            </h3>
          </Link>
          <p className="text-zinc-400 text-xs">
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>

      {/* Image */}
      <Link href={`/posts/${post.id}`}>
        <div className="relative w-full aspect-square bg-black">
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      </Link>

      {/* Actions: Like, Comment, Save */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              disabled={isLiking}
              className="flex items-center gap-1.5 group"
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-white group-hover:text-red-500"
                }`}
              />
              <span className="text-white text-sm font-medium">{likesCount}</span>
            </button>

            {/* Comment Button */}
            <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 group">
              <MessageCircle className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
              <span className="text-white text-sm font-medium">
                {post.commentsCount || 0}
              </span>
            </Link>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            className="group"
          >
            <Bookmark
              className={`w-6 h-6 transition-all ${
                isSaved
                  ? "fill-purple-500 text-purple-500"
                  : "text-white group-hover:text-purple-400"
              }`}
            />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-sm text-zinc-200">
            <Link href={`/profile/${post.user?.username}`}>
              <span className="font-semibold hover:underline">
                {post.user?.username || "user"}
              </span>
            </Link>{" "}
            <span className="text-zinc-300">{post.caption}</span>
          </div>
        )}

        {/* View Comments Link */}
        {post.commentsCount > 0 && (
          <Link href={`/posts/${post.id}`}>
            <p className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
              View all {post.commentsCount} comments
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}