// src/app/me/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { profileService, postsService } from "@/services/api";
import { Profile, Post } from "@/types";
import { ArrowLeft, Send, Grid3x3, Bookmark, Loader2, Home, Plus, User, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type TabType = "gallery" | "saved";

export default function MyProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("gallery");
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getMyProfile();
        
        console.log("📦 Profile API response:", data);
        
        // Handle nested data structure
        const profileData = data.data?.profile || data.profile || data.data || data;
        console.log("✅ Processed profile:", profileData);
        
        setProfile(profileData);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch posts when tab changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user?.username && !profile?.username) {
        console.log("⚠️ No username available yet");
        return;
      }

      try {
        setIsLoadingPosts(true);
        const username = user?.username || profile?.username;

        if (activeTab === "gallery") {
          console.log("📸 Fetching user posts for:", username);
          const response = await postsService.getUserPosts(username!, 1, 12);
          console.log("✅ User posts response:", response);
          
          const postsData = response.data || [];
          console.log("✅ Processed posts:", postsData);
          setPosts(Array.isArray(postsData) ? postsData : []);
        } else {
          console.log("💾 Fetching saved posts");
          const response = await postsService.getMySavedPosts(1, 12);
          console.log("✅ Saved posts response:", response);
          
          const savedData = response.data || [];
          console.log("✅ Processed saved posts:", savedData);
          setSavedPosts(Array.isArray(savedData) ? savedData : []);
        }
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        // Set empty array on error
        if (activeTab === "gallery") {
          setPosts([]);
        } else {
          setSavedPosts([]);
        }
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (profile) {
      fetchPosts();
    }
  }, [activeTab, user?.username, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // ← ADD SAFETY CHECK HERE
  const displayPosts = activeTab === "gallery" ? posts : savedPosts;
  const safeDisplayPosts = Array.isArray(displayPosts) ? displayPosts : [];
  
  const stats = profile?.stats || { postsCount: 0, followersCount: 0, followingCount: 0, likesCount: 0 };

  console.log("📊 Display state:", { 
    activeTab, 
    displayPosts: safeDisplayPosts, 
    postsLength: safeDisplayPosts.length,
    isLoadingPosts 
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

          <div className="relative flex-1 max-w-[812px]">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full h-12 bg-[#121212] border border-white/5 rounded-xl py-2.5 pl-4 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>

          <Link href="/me" className="flex items-center gap-3 min-w-[180px] justify-end group">
            <span className="font-medium text-sm">{user?.name || profile?.name || "John Doe"}</span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-purple-500 transition-all flex items-center justify-center">
              <Image src="/profile-icon.png" alt="Profile" width={40} height={40} className="object-cover" />
            </div>
          </Link>
        </div>
      </header>

      {/* HEADER - Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50 flex items-center px-4">
        <Link href="/feed">
          <button className="mr-3">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </Link>
        <h1 className="text-lg font-bold">{profile?.name || user?.name || "John Doe"}</h1>
        <div className="ml-auto">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
            <Image src="/profile-icon.png" alt="Profile" width={36} height={36} className="object-cover" />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="pt-24 md:pt-[120px] max-w-4xl mx-auto px-4 pb-32 md:pb-20">
        {/* Profile Section */}
        <div className="mb-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              <Image src="/profile-icon.png" alt="Profile" width={96} height={96} className="object-cover" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {profile?.name || user?.name || "John Doe"}
                  </h2>
                  <p className="text-zinc-400 text-sm md:text-base">
                    {profile?.username || user?.username || "johndoe"}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <Link href="/me/edit">
                    <button className="px-6 py-2 bg-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-colors border border-white/20">
                      Edit Profile
                    </button>
                  </Link>
                  <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <p className="text-zinc-300 mb-4 text-sm md:text-base max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8">
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats.postsCount}
                  </p>
                  <p className="text-xs md:text-sm text-zinc-400">Post</p>
                </div>
                <Link href="/me/followers">
                  <div className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats.followersCount}
                    </p>
                    <p className="text-xs md:text-sm text-zinc-400">Followers</p>
                  </div>
                </Link>
                <Link href="/me/following">
                  <div className="text-center md:text-left cursor-pointer hover:opacity-80 transition-opacity">
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {stats.followingCount}
                    </p>
                    <p className="text-xs md:text-sm text-zinc-400">Following</p>
                  </div>
                </Link>
                <div className="text-center md:text-left">
                  <p className="text-xl md:text-2xl font-bold text-white">
                    {stats.likesCount}
                  </p>
                  <p className="text-xs md:text-sm text-zinc-400">Likes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/10">
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex items-center gap-2 pb-3 md:pb-4 border-b-2 transition-colors ${
                  activeTab === "gallery"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Grid3x3 className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Gallery</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 pb-3 md:pb-4 border-b-2 transition-colors ${
                  activeTab === "saved"
                    ? "border-white text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Saved</span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {isLoadingPosts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : safeDisplayPosts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
              {activeTab === "gallery" ? (
                <Grid3x3 className="w-10 h-10 md:w-12 md:h-12 text-zinc-600" />
              ) : (
                <Bookmark className="w-10 h-10 md:w-12 md:h-12 text-zinc-600" />
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">
              {activeTab === "gallery" ? "Your story starts here" : "No saved posts yet"}
            </h3>
            <p className="text-sm md:text-base text-zinc-400 mb-6 max-w-md mx-auto px-4">
              {activeTab === "gallery"
                ? "Share your first post and let the world see your moments, passions, and memories. Make this space truly yours."
                : "Posts you save will appear here. Start saving posts you want to revisit later."}
            </p>
            {activeTab === "gallery" && (
              <Link href="/create">
                <button className="px-6 md:px-8 py-2.5 md:py-3 bg-purple-600 text-white text-sm md:text-base font-semibold rounded-full hover:bg-purple-700 transition-colors">
                  Upload My First Post
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {safeDisplayPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="relative aspect-square bg-zinc-900 overflow-hidden rounded-lg group cursor-pointer">
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || "Post"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Hover Overlay - Desktop only */}
                  <div className="hidden md:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                      <span className="font-semibold text-sm md:text-base">{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                      <span className="font-semibold text-sm md:text-base">{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* BOTTOM NAVIGATION - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex items-center justify-around h-full px-6">
          <Link href="/feed" className="flex flex-col items-center gap-1 group">
            <Home className="w-6 h-6 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">Home</span>
          </Link>

          <Link href="/create" className="relative -mt-6">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all">
              <Plus className="w-7 h-7 text-white" />
            </div>
          </Link>

          <Link href="/me" className="flex flex-col items-center gap-1 group">
            <User className="w-6 h-6 text-purple-500" />
            <span className="text-xs font-medium text-purple-500">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
