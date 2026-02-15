"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, X, CheckCircle2 } from "lucide-react";
import { profileService } from "@/services/api";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: "John Doe",
    username: "johndoe",
    email: "johndoe@email.com",
    numberPhone: "081234567890",
    bio: "Creating unforgettable moments with my favorite person! ✨ Let's cherish every second together!"
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string>("/profile-icon.png");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileService.getMyProfile();
        const data = (res as any).data?.profile || (res as any).data || res;
        setFormData({
          name: data.name || "John Doe",
          username: data.username || "johndoe",
          email: data.email || "johndoe@email.com",
          numberPhone: data.numberPhone || "081234567890",
          bio: data.bio || "Creating unforgettable moments with my favorite person! ✨ Let's cherish every second together!"
        });
        if (data.avatarUrl || data.avatar) setAvatarPreview(data.avatarUrl || data.avatar);
      } catch (error) { console.error(error); } finally { setIsFetching(false); }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (selectedFile) data.append("avatar", selectedFile);
      await profileService.updateProfile(data);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); router.push("/me"); }, 2000);
    } catch (error) { alert("Update failed"); } finally { setIsLoading(false); }
  };

  if (isFetching) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* SUCCESS NOTIFICATION */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px] animate-in slide-in-from-top-4">
          <div className="bg-[#108544] text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="font-semibold text-sm">Profile Success Update</span>
            </div>
            <X size={18} className="cursor-pointer opacity-70" onClick={() => setShowSuccess(false)} />
          </div>
        </div>
      )}

      {/* HEADER - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-black border-b border-white/10 z-50 items-center">
        <div className="w-full px-[120px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 min-w-[180px]">
            <Image src="/Logo.png" alt="Sociality" width={32} height={32} />
            <span className="text-xl font-bold uppercase tracking-wider">Sociality</span>
          </Link>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-[812px]">
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full h-12 bg-[#121212] border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-500"
            />
          </div>

          {/* Profile */}
          <Link href="/me" className="flex items-center gap-3 min-w-[180px] justify-end group">
            <span className="font-medium text-sm">{user?.name || "John Doe"}</span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all flex items-center justify-center">
              <Image src={avatarPreview} alt="Profile" width={40} height={40} className="object-cover" />
            </div>
          </Link>
        </div>
      </header>

      {/* HEADER - Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black border-b border-white/10 z-50 flex items-center justify-between px-4">
        <button onClick={() => router.back()} className="hover:bg-white/10 p-2 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Edit Profile</h1>
        <div className="w-9 h-9"></div> {/* Empty div for balance */}
      </header>

      {/* CONTENT - DESKTOP: Positioned under search bar with proper spacing */}
      <main className="pt-20 md:pt-[120px] pb-20">
        {/* Desktop Container - Aligns with search bar (max-w-[812px]) */}
        <div className="hidden md:block px-[120px]">
          <div className="max-w-[1440px] mx-auto">
            {/* Back Button and Title - Position X: 80, Y: 80 from content start */}
            <div className="flex items-center gap-4 mb-10" style={{ marginLeft: '80px', marginTop: '80px' }}>
              <button onClick={() => router.back()} className="hover:bg-white/10 p-2 rounded-full transition">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>

            {/* Form Container - Auto Layout Horizontal, Spacing: 40px */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-0" style={{ marginLeft: '80px' }}>
                {/* LEFT: CHANGE PHOTO SECTION - Width: 160px, Height: 194px, Gap: 16px */}
                <div className="flex flex-col items-center" style={{ width: '230px', gap: '16px' }}>
                  {/* Profile Photo - 160x160px circle */}
                  <div className="relative" style={{ width: '130px', height: '130px' }}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                      <Image src={avatarPreview} alt="Profile" width={160} height={160} className="object-cover w-full h-full" />
                    </div>

                  </div>
                  
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setSelectedFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                  }} className="hidden" accept="image/*" />
                  
                  {/* Change Photo Button - Width: 160px, Height: 48px, Padding: 16px 8px */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-black text-white rounded-full text-sm font-semibold hover:bg-zinc-900 transition"
                    style={{ height: '48px', padding: '16px 8px' }}
                  >
                    Change Photo
                  </button>
                </div>

                {/* RIGHT: FORM FIELDS SECTION - Auto Layout Vertical, Spacing: 32px, Width: 800px */}
                <div className="flex-1 space-y-8" style={{ maxWidth: '800px' }}>
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Name</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Username</label>
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="johndoe"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="johndoe@email.com"
                    />
                  </div>

                  {/* Number Phone Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Number Phone</label>
                    <input
                      type="tel"
                      value={formData.numberPhone}
                      onChange={(e) => setFormData({...formData, numberPhone: e.target.value})}
                      className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="081234567890"
                    />
                  </div>

                  {/* Bio Field - Height: 611px according to Figma */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={8}
                      className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                      placeholder="Tell us about yourself"
                      style={{ minHeight: '160px' }}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#7C3AED]/50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* MOBILE Layout */}
        <div className="md:hidden px-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* CHANGE PHOTO SECTION */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <div className="relative w-32 h-32">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-zinc-900">
                  <Image src={avatarPreview} alt="Profile" fill className="object-cover" />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full border-4 border-black hover:bg-purple-700 transition"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setSelectedFile(file); setAvatarPreview(URL.createObjectURL(file)); }
              }} className="hidden" accept="image/*" />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 bg-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-800 transition"
              >
                Change Photo
              </button>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Username</label>
                <input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="johndoe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="johndoe@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Number Phone</label>
                <input
                  type="tel"
                  value={formData.numberPhone}
                  onChange={(e) => setFormData({...formData, numberPhone: e.target.value})}
                  className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="081234567890"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={5}
                  className="w-full bg-[#1A1D29] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#7C3AED]/50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}