"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Grid, MessageSquare, Heart, UserPlus, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { profileService, postsService } from "@/services/api";

// Definisikan tipe data sesuai dengan struktur API Anda
interface UserProfile {
  id: number;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface Post {
  id: number;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        // Mengambil data profil berdasarkan username
        const res = await profileService.getProfileByUsername(username);
        const profileData = res.data?.profile || res.data || res;
        setProfile(profileData);
        setIsFollowing(profileData.isFollowing);

        // Mengambil post milik user tersebut
        const postsRes = await postsService.getUserPosts(username);
        setPosts(postsRes.data?.posts || postsRes.data || []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) fetchProfileData();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <button onClick={() => router.back()} className="text-purple-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="h-16 max-w-[1200px] mx-auto px-6 md:px-[120px] flex items-center gap-6">
          <button onClick={() => router.back()} className="hover:bg-white/10 p-2 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">{profile.name}</h1>
            <span className="text-xs text-zinc-500">{profile.postCount || 0} Posts</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 md:px-[120px] pt-8">
        {/* PROFILE INFO SECTION */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12">
          {/* Avatar */}
          <div className="relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-zinc-900">
              <Image 
                src={profile.avatarUrl || profile.avatar || "/profile-icon.png"} 
                alt={profile.name} 
                fill 
                className="object-cover" 
              />
            </div>
          </div>

          {/* Stats & Bio */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <h2 className="text-xl font-bold">@{profile.username}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    isFollowing 
                    ? "bg-zinc-800 text-white border border-white/10" 
                    : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {isFollowing ? (
                    <div className="flex items-center gap-2"><UserCheck size={16}/> Following</div>
                  ) : (
                    <div className="flex items-center gap-2"><UserPlus size={16}/> Follow</div>
                  )}
                </button>
                <button className="p-2 bg-zinc-800 rounded-full border border-white/10 hover:bg-zinc-700 transition">
                  <MessageSquare size={20} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-6 border-y border-white/5 py-4 w-full md:w-auto md:border-none">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-lg">{profile.postCount || 0}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-lg">{profile.followerCount || 0}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-lg">{profile.followingCount || 0}</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-center md:text-left">
              <p className="font-bold text-sm mb-1">{profile.name}</p>
              <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed max-w-md">
                {profile.bio || "No bio yet."}
              </p>
            </div>
          </div>
        </section>

        {/* POSTS GRID SECTION */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest text-white">
            <Grid size={16} /> Posts
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
              <p className="text-zinc-500">This user hasn't posted anything yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="group relative aspect-square bg-zinc-900 overflow-hidden rounded-md md:rounded-xl">
                  <Image 
                    src={post.imageUrl} 
                    alt="User post" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2">
                      <Heart size={20} className="fill-white" />
                      <span className="font-bold">{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={20} className="fill-white" />
                      <span className="font-bold">{post.commentCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}