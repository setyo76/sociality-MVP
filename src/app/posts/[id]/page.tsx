// src/app/posts/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { postsService, likesService, commentsService } from '@/services/api';
import { Post, Comment } from '@/types';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  MoreHorizontal, 
  Trash2, 
  Loader2,
  Send 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

// Setup dayjs
dayjs.extend(relativeTime);
dayjs.locale('id');

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debugging
  useEffect(() => {
    console.log('📊 PostDetail mounted with postId:', postId);
    console.log('👤 Current user:', user);
  }, [postId, user]);

  // Fetch post detail
  useEffect(() => {
    fetchPostDetail();
    fetchComments(1, true);
  }, [postId]);

  const fetchPostDetail = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching post detail for ID:', postId);
      
      const data = await postsService.getPost(postId);
      console.log('✅ Post detail received:', data);
      
      setPost(data);
      setIsLiked(data.likedByMe || false);
      setLikeCount(data.likeCount || 0);
      setCommentCount(data.commentCount || 0);
      setIsSaved(data.savedByMe || false);
    } catch (err: any) {
      console.error('❌ Error fetching post:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      setError('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (page: number, reset = false) => {
    try {
      setIsLoadingComments(true);
      const response = await commentsService.getComments(postId, page, 10);
      console.log('✅ Comments received:', response);
      
      const newComments = response.data || [];
      setComments(prev => reset ? newComments : [...prev, ...newComments]);
      setCommentsPage(page);
      setHasMoreComments(newComments.length === 10);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLoadMoreComments = () => {
    if (!isLoadingComments && hasMoreComments) {
      fetchComments(commentsPage + 1);
    }
  };

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await likesService.likePost(postId);
      } else {
        await likesService.unlikePost(postId);
      }
    } catch (err) {
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (newSavedState) {
        console.log('Save post:', postId);
      } else {
        console.log('Unsave post:', postId);
      }
    } catch (err) {
      setIsSaved(!newSavedState);
      console.error('Error toggling save:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    const commentText = newComment.trim();
    setNewComment('');

    try {
      setIsSubmittingComment(true);
      
      const tempId = Date.now();
      const tempComment: Comment = {
        id: tempId,
        content: commentText,
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id || 0,
          username: user?.username || '',
          name: user?.name || '',
          avatar: user?.avatar || null
        }
      };
      
      setComments(prev => [tempComment, ...prev]);
      setCommentCount(prev => prev + 1);

      const newCommentData = await commentsService.addComment(postId, commentText);
      console.log('✅ Comment added:', newCommentData);
      
      setComments(prev => 
        prev.map(c => c.id === tempId ? newCommentData : c)
      );
      
    } catch (err: any) {
      console.error('❌ Error adding comment:', err);
      console.error('❌ Error response:', err.response?.data);
      
      setComments(prev => prev.filter(c => c.id !== Date.now()));
      setCommentCount(prev => prev - 1);
      setNewComment(commentText);
      
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
      
      await commentsService.deleteComment(commentId.toString());
    } catch (err) {
      fetchComments(1, true);
      console.error('Error deleting comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setIsDeleting(true);
      await postsService.deletePost(postId);
      router.push('/feed');
    } catch (err) {
      console.error('Error deleting post:', err);
      setIsDeleting(false);
    }
  };

  const isOwner = post?.author?.id === user?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-b border-white/10 z-50 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-semibold">Post</h1>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showOptions && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full px-4 py-3 text-left text-red-500 hover:bg-white/10 flex items-center gap-2 transition-colors"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Post
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-8 max-w-2xl mx-auto">
        {/* Post Card */}
        <div className="bg-[#121212] border-b border-white/10">
          {/* Author Info */}
          <div className="p-4 flex items-center justify-between">
            <Link href={`/profile/${post.author?.username}`}>
              <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                  {post.author?.avatar ? (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name || 'User'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                      {post.author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{post.author?.name || 'Unknown'}</p>
                  <p className="text-xs text-zinc-500">
                    {dayjs(post.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className="relative w-full aspect-square bg-black">
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Post image'}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={handleLike}
                className="transition-colors hover:scale-110 active:scale-95"
              >
                <Heart
                  className={`w-7 h-7 ${
                    isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-400'
                  }`}
                />
              </button>
              <Link href={`/posts/${post.id}`}>
                <MessageCircle className="w-7 h-7 text-zinc-400 hover:text-purple-400 transition-colors" />
              </Link>
              <button
                onClick={handleSave}
                className="ml-auto hover:scale-110 active:scale-95 transition-transform"
              >
                <Bookmark
                  className={`w-7 h-7 ${
                    isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-400'
                  }`}
                />
              </button>
            </div>

            {/* Like Count */}
            {likeCount > 0 && (
              <p className="text-sm font-semibold mb-2">
                {likeCount.toLocaleString()} likes
              </p>
            )}

            {/* Caption */}
            {post.caption && (
              <div className="mb-2">
                <Link href={`/profile/${post.author?.username}`}>
                  <span className="font-semibold mr-2 hover:underline">
                    {post.author?.username}
                  </span>
                </Link>
                <span className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {post.caption}
                </span>
              </div>
            )}

            {/* Comment Count Link */}
            {commentCount > 0 && (
              <button
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm text-zinc-500 hover:text-zinc-400"
              >
                View all {commentCount} comments
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="p-4">
          <h2 className="font-semibold mb-4">Comments ({commentCount})</h2>

          {/* Comment Composer */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || 'Your avatar'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-4 py-1.5 bg-purple-600 text-white text-sm font-semibold rounded-full disabled:bg-zinc-700 disabled:text-zinc-400 flex items-center gap-2"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profile/${comment.author?.username}`}>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
                    {comment.author?.avatar ? (
                      <Image
                        src={comment.author.avatar}
                        alt={comment.author.name || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold">
                        {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="bg-[#1a1a1a] rounded-lg px-3 py-2">
                    <Link href={`/profile/${comment.author?.username}`}>
                      <span className="text-xs font-semibold hover:underline">
                        {comment.author?.username}
                      </span>
                    </Link>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                    <span>{dayjs(comment.createdAt).fromNow()}</span>
                    {(comment.author?.id === user?.id || isOwner) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading More Comments */}
            {isLoadingComments && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              </div>
            )}

            {/* Load More Button */}
            {hasMoreComments && !isLoadingComments && comments.length > 0 && (
              <button
                onClick={handleLoadMoreComments}
                className="text-sm text-purple-500 hover:text-purple-400 font-semibold"
              >
                Load more comments...
              </button>
            )}

            {/* Empty Comments */}
            {comments.length === 0 && !isLoadingComments && (
              <p className="text-center text-zinc-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}