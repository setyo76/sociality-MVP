// src/app/posts/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { postsService, commentsService } from '@/services/api';

interface Author {
  id: number;
  username: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
}

interface Post {
  id: number;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoadingPost(true);
        console.log('📥 Fetching post:', postId);

        const response = await postsService.getPost(postId);
        console.log('✅ Post response:', response);

        // Handle nested response structure
        const postData =
          response.data?.post || response.post || response.data || response;

        setPost(postData);
      } catch (error) {
        console.error('❌ Error fetching post:', error);
      } finally {
        setIsLoadingPost(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        console.log('💬 Fetching comments for post:', postId);

        const response = await commentsService.getComments(postId);
        console.log('✅ Comments response:', response);

        // Handle different response structures
        let commentsData: Comment[] = [];

        if (response.data && Array.isArray(response.data.comments)) {
          commentsData = response.data.comments;
        } else if (Array.isArray(response.comments)) {
          commentsData = response.comments;
        } else if (response.data && Array.isArray(response.data)) {
          commentsData = response.data;
        } else if (Array.isArray(response)) {
          commentsData = response;
        }

        console.log('📋 Parsed comments:', commentsData);
        setComments(commentsData);
      } catch (error) {
        console.error('❌ Error fetching comments:', error);
        setComments([]); // Set empty array on error
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      console.log('💬 Submitting comment:', commentText);

      const newComment = await commentsService.addComment(postId, commentText);
      console.log('✅ Comment added:', newComment);

      // Add new comment to list
      setComments([newComment, ...comments]);
      setCommentText('');

      // Update comment count in post
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center'>
        <Loader2 className='w-8 h-8 text-purple-500 animate-spin' />
      </div>
    );
  }

  if (!post) {
    return (
      <div className='min-h-screen bg-black flex flex-col items-center justify-center text-white'>
        <h2 className='text-2xl font-bold mb-4'>Post not found</h2>
        <Link href='/feed'>
          <button className='px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-all'>
            Back to Feed
          </button>
        </Link>
      </div>
    );
  }

  const avatarUrl = post.author?.avatarUrl || post.author?.avatar;

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50 flex items-center px-4'>
        <button
          onClick={() => router.back()}
          className='mr-3 cursor-pointer hover:opacity-70 transition-opacity'
        >
          <ArrowLeft className='w-6 h-6' />
        </button>
        <h1 className='text-lg font-bold'>Post</h1>
      </header>

      {/* Content */}
      <main className='pt-16 pb-24 max-w-2xl mx-auto'>
        {/* Post */}
        <article className='border-b border-white/10'>
          {/* Post Header */}
          <div className='p-4 flex items-center justify-between'>
            <Link
              href={`/profile/${post.author?.username}`}
              className='flex items-center gap-3 hover:opacity-80 transition-opacity group'
            >
              <div className='w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-all'>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold'>
                    {post.author.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <p className='font-bold group-hover:text-purple-400 transition-colors'>
                  {post.author.name}
                </p>
                <p className='text-xs text-zinc-400'>@{post.author.username}</p>
              </div>
            </Link>
            <button className='p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer'>
              <MoreVertical className='w-5 h-5 text-zinc-400' />
            </button>
          </div>

          {/* Post Image */}
          {post.imageUrl && (
            <div className='relative w-full aspect-square bg-zinc-900'>
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Post'}
                fill
                sizes='(max-width: 768px) 100vw, 672px'
                className='object-cover'
              />
            </div>
          )}

          {/* Post Actions */}
          <div className='p-4'>
            <div className='flex gap-4 mb-3'>
              <button
                className={`flex items-center gap-1.5 transition-all cursor-pointer group ${
                  post.likedByMe
                    ? 'text-red-500'
                    : 'text-zinc-400 hover:text-red-500'
                }`}
              >
                <Heart
                  className={`w-6 h-6 group-hover:scale-110 group-active:scale-95 transition-transform ${
                    post.likedByMe ? 'fill-red-500' : ''
                  }`}
                />
                {post.likeCount > 0 && (
                  <span className='text-sm font-semibold'>
                    {post.likeCount}
                  </span>
                )}
              </button>

              <button className='flex items-center gap-1.5 text-zinc-400 hover:text-purple-400 transition-all group cursor-pointer'>
                <MessageCircle className='w-6 h-6 group-hover:scale-110 group-active:scale-95 transition-transform' />
                {post.commentCount > 0 && (
                  <span className='text-sm font-semibold'>
                    {post.commentCount}
                  </span>
                )}
              </button>
            </div>

            {/* Like Count */}
            {post.likeCount > 0 && (
              <p className='text-sm font-semibold mb-2'>
                {post.likeCount === 1
                  ? '1 like'
                  : `${post.likeCount.toLocaleString()} likes`}
              </p>
            )}

            {/* Caption */}
            {post.caption && (
              <p className='text-sm'>
                <Link
                  href={`/profile/${post.author.username}`}
                  className='cursor-pointer'
                >
                  <span className='font-bold hover:text-purple-400 transition-colors'>
                    {post.author.username}
                  </span>
                </Link>
                <span className='text-zinc-300 ml-2'>{post.caption}</span>
              </p>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <div className='p-4'>
          <h2 className='font-bold text-lg mb-4'>
            Comments {post.commentCount > 0 && `(${post.commentCount})`}
          </h2>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='w-6 h-6 text-purple-500 animate-spin' />
            </div>
          ) : comments.length === 0 ? (
            <div className='text-center py-8'>
              <MessageCircle className='w-12 h-12 text-zinc-600 mx-auto mb-3' />
              <p className='text-zinc-400'>No comments yet</p>
              <p className='text-zinc-500 text-sm'>Be the first to comment!</p>
            </div>
          ) : (
            <div className='space-y-4 mb-6'>
              {comments.map((comment) => {
                const commentAvatarUrl =
                  comment.author?.avatarUrl || comment.author?.avatar;

                return (
                  <div key={comment.id} className='flex gap-3'>
                    <Link href={`/profile/${comment.author.username}`} className="flex-shrink-0">
    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-white/10 hover:border-purple-500 transition-all">
      {commentAvatarUrl ? (
        <Image src={commentAvatarUrl} alt={comment.author.name} width={32} height={32} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold">
          {comment.author.name?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </div>
  </Link>
  <div className="flex-1">
    <div className="bg-[#1a1a1a] rounded-2xl px-4 py-2">
      <Link href={`/profile/${comment.author.username}`}>
        <p className="font-semibold text-sm hover:text-purple-400 transition-colors cursor-pointer">
          {comment.author.name}
        </p>
      </Link>
                        <p className='text-sm text-zinc-300'>
                          {comment.content}
                        </p>
                      </div>
                      <p className='text-xs text-zinc-500 mt-1 ml-4'>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Comment Input - Fixed Bottom */}
      <div className='fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50'>
        <form
          onSubmit={handleSubmitComment}
          className='max-w-2xl mx-auto p-4 flex gap-3'
        >
          <input
            type='text'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder='Add a comment...'
            disabled={isSubmitting}
            className='flex-1 bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-500 disabled:opacity-50'
          />
          <button
            type='submit'
            disabled={!commentText.trim() || isSubmitting}
            className='px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all cursor-pointer'
          >
            {isSubmitting ? (
              <Loader2 className='w-5 h-5 animate-spin' />
            ) : (
              <Send className='w-5 h-5' />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
