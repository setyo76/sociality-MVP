// src/app/feed/page.tsx

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchFeed, fetchExplore } from "@/store/slices/postsSlice";
import { getCurrentUser } from "@/store/slices/authSlice";
import { Home, Compass, User, Heart, MessageCircle, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";

export default function FeedPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"feed" | "explore">("feed");
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    feed,
    explore,
    isLoadingFeed,
    isLoadingExplore,
    feedPage,
    explorePage,
    feedHasMore,
    exploreHasMore,
  } = useSelector((state: RootState) => state.posts);
  
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  // Fetch user on mount
  useEffect(() => {
    if (!user && !isLoading) {
      console.log("👤 Fetching current user...");
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isLoading]);

  // Fetch initial feed
  useEffect(() => {
    if (feed.length === 0) {
      console.log("📱 Initial feed fetch...");
      dispatch(fetchFeed(1));
    }
  }, [dispatch, feed.length]);

  // ← CRITICAL: Handle tab switch properly
  useEffect(() => {
    console.log("🔄 Tab changed to:", activeTab);
    console.log("📊 Current state:", {
      activeTab,
      exploreLength: explore.length,
      isLoadingExplore
    });

    if (activeTab === "explore") {
      console.log("🔍 [Effect] Explore tab active, checking if need to fetch...");
      if (explore.length === 0 && !isLoadingExplore) {
        console.log("🔍 [Effect] Dispatching fetchExplore(1)...");
        dispatch(fetchExplore(1));
      } else {
        console.log("⚠️ [Effect] Skipping fetch:", {
          exploreLength: explore.length,
          isLoadingExplore
        });
      }
    }
  }, [activeTab, dispatch, explore.length, isLoadingExplore]);

  const currentPosts = activeTab === "feed" ? feed : explore;
  const isLoadingPosts = activeTab === "feed" ? isLoadingFeed : isLoadingExplore;
  const currentPage = activeTab === "feed" ? feedPage : explorePage;
  const hasMore = activeTab === "feed" ? feedHasMore : exploreHasMore;

  const loadMore = useCallback(() => {
    if (!isLoadingPosts && hasMore) {
      console.log(`📦 Loading more ${activeTab} - page ${currentPage + 1}`);
      if (activeTab === "feed") {
        dispatch(fetchFeed(currentPage + 1));
      } else {
        dispatch(fetchExplore(currentPage + 1));
      }
    }
  }, [dispatch, isLoadingPosts, hasMore, currentPage, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore]);

  const hasPosts = Array.isArray(currentPosts) && currentPosts.length > 0;

  // ← Log render
  useEffect(() => {
    console.log("🎨 Rendering FeedPage:", {
      activeTab,
      feedCount: feed.length,
      exploreCount: explore.length,
      currentPostsCount: currentPosts.length,
      hasPosts,
      isLoadingPosts
    });
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-black border-b border-white/10 z-50 items-center">
        <div className="w-full px-[120px] flex items-center justify-between gap-6">
          <Link href="/feed" className="flex items-center gap-2 min-w-[180px]">
            <Image src="/Logo.png" alt="Sociality" width={32} height={32} />
            <span className="text-xl font-bold uppercase tracking-wider">Sociality</span>
          </Link>

          <SearchBar />

          <Link href="/me" className="flex items-center gap-3 min-w-[180px] justify-end group">
            <span className="font-medium text-sm">{user?.name || "Loading..."}</span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all flex items-center justify-center">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.name || "Profile"} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* HEADER - Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50 flex items-center px-4">
        <Link href="/feed" className="flex items-center gap-2 flex-1">
          <Image src="/Logo.png" alt="Sociality" width={28} height={28} />
          <span className="text-lg font-bold uppercase tracking-wider">Sociality</span>
        </Link>
        <SearchBar />
        <Link href="/me" className="ml-2">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
            {user?.avatar ? (
              <Image src={user.avatar} alt={user.name || "Profile"} width={36} height={36} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </Link>
      </header>

      {/* CONTENT */}
      <main className="pt-24 md:pt-[120px] max-w-2xl mx-auto px-4 pb-32 md:pb-20">
        {/* Tab Switcher */}
        <div className="hidden md:flex justify-center gap-2 mb-10 p-1 bg-[#121212] rounded-2xl w-fit mx-auto border border-white/5">
          <button
            onClick={() => {
              console.log("👆 Feed button clicked");
              setActiveTab("feed");
            }}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "feed" ? "bg-white text-black" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => {
              console.log("👆 Explore button clicked");
              setActiveTab("explore");
            }}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "explore" ? "bg-white text-black" : "text-zinc-500 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" /> Explore
          </button>
        </div>

        {/* Posts */}
        {!hasPosts && !isLoadingPosts ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              {activeTab === "feed" ? <Heart className="w-12 h-12 text-zinc-600" /> : <Compass className="w-12 h-12 text-zinc-600" />}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {activeTab === "feed" ? "Your feed is empty" : "No posts to explore yet"}
            </h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed px-4">
              {activeTab === "feed" ? "Follow other users or create your first post to see content here." : "Be the first to share something amazing!"}
            </p>
            <Link href="/create">
              <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all">
                Create Your First Post
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {currentPosts.map((post) => (
              <article key={post.id} className="bg-[#121212]/50 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all">
                <div className="p-4 flex items-center justify-between">
                  <Link 
    href={`/profile/${post.author?.username}`} 
    className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
  >
    <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-all">
      {post.author?.avatar || post.author?.avatarUrl ? (
        <Image 
          src={post.author.avatar || post.author.avatarUrl || ""} 
          alt={post.author.name || "User"} 
          width={36} 
          height={36} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-xs font-bold">
          {post.author?.name?.[0]?.toUpperCase() || "U"}
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
        {post.author?.name || "Unknown"}
      </p>
      {/* Opsional: Tambahkan username kecil di bawah nama jika desain mengizinkan */}
      <p className="text-[10px] text-zinc-500">@{post.author?.username}</p>
    </div>
  </Link>
                </div>

                {post.imageUrl && (
                  <Link href={`/posts/${post.id}`}>
                    <div className="relative w-full aspect-square bg-zinc-900 cursor-pointer">
                      <Image 
                        src={post.imageUrl} 
                        alt={post.caption || "Post"} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover" 
                      />
                    </div>
                  </Link>
                )}

                <div className="p-5">
                  <div className="flex gap-4 mb-3 text-zinc-400">
                    <button className="hover:text-red-500 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                    <Link href={`/posts/${post.id}`}>
                      <button className="hover:text-purple-400 transition-colors">
                        <MessageCircle className="w-6 h-6" />
                      </button>
                    </Link>
                  </div>

                  {post.caption && (
                    <p className="text-sm text-zinc-300">
                      <Link href={`/profile/${post.author?.username || "unknown"}`}>
                        <span className="font-bold text-white mr-2 hover:opacity-80 cursor-pointer">
                          {post.author?.username || "unknown"}
                        </span>
                      </Link>
                      {post.caption}
                    </p>
                  )}
                </div>
              </article>
            ))}

            {isLoadingPosts && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            )}

            <div ref={observerTarget} className="h-4" />
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex items-center justify-around h-full px-6">
          <Link href="/feed" className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-white" />
            <span className="text-xs font-medium text-white">Home</span>
          </Link>
          <Link href="/create" className="relative -mt-6">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Plus className="w-7 h-7 text-white" />
            </div>
          </Link>
          <Link href="/me" className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}