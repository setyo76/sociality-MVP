// src/app/create/page.tsx

"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import apiClient from "@/lib/api"; // ← CHANGE: Import apiClient directly
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, or WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");
    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDeleteImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ← UPDATED: Submit function
  const handleSubmit = async () => {
    if (!image) {
      setError("Please select an image");
      return;
    }

    // Caption is optional per API docs
    // No need to validate caption

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      
      // ← CRITICAL: Append file with proper filename
      formData.append("image", image, image.name);
      
      // ← Only append caption if not empty (optional field)
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      console.log("📤 Uploading post...");
      console.log("- File:", image.name, image.type, `${(image.size / 1024).toFixed(2)}KB`);
      console.log("- Caption:", caption.trim() || "(none)");

      // ← DIRECT API CALL
      const response = await apiClient.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Post created successfully:", response.data);

      // Redirect to feed
      router.push("/feed");
    } catch (err: any) {
      console.error("❌ Full error:", err);
      console.error("❌ Response:", err.response);
      console.error("❌ Status:", err.response?.status);
      console.error("❌ Data:", err.response?.data);

      // Better error message
      let errorMessage = "Failed to create post. Please try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER - Desktop */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 bg-black border-b border-white/10 z-50 items-center">
        <div className="w-full px-[120px] flex items-center justify-between gap-6">
          <Link href="/feed" className="flex items-center gap-2 min-w-[180px]">
            <Image src="/Logo.png" alt="Sociality" width={32} height={32} />
            <span className="text-xl font-bold uppercase tracking-wider">Sociality</span>
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">Add Post</h1>
          </div>

          <Link href="/me" className="flex items-center gap-3 min-w-[180px] justify-end group">
            <span className="font-medium text-sm">{user?.name || "John Doe"}</span>
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all flex items-center justify-center">
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
        <h1 className="text-lg font-bold flex-1">Add Post</h1>
        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
          <Image src="/profile-icon.png" alt="Profile" width={36} height={36} className="object-cover" />
        </div>
      </header>

      {/* CONTENT */}
      <main className="pt-24 md:pt-[120px] max-w-2xl mx-auto px-4 pb-8">
        <div className="max-w-xl mx-auto">
          {/* Photo Section */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Photo</label>
            
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative border-2 border-dashed border-white/20 rounded-2xl bg-[#0a0a0a] hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-zinc-500" />
                  </div>
                  <p className="text-center mb-2">
                    <span className="text-purple-500 font-semibold">Click to upload</span>
                    <span className="text-zinc-400"> or drag and drop</span>
                  </p>
                  <p className="text-zinc-500 text-sm">PNG or JPG (max. 5mb)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "1/1" }}>
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-lg hover:bg-black transition-colors border border-white/10"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Change Image</span>
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm text-red-500 rounded-lg hover:bg-black transition-colors border border-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Image</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Caption <span className="text-zinc-500 font-normal text-sm">(optional)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Create your caption"
              rows={6}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
              maxLength={2000}
            />
            <p className="text-zinc-500 text-xs mt-2 text-right">
              {caption.length}/2000
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !image}
            className="w-full py-3.5 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </span>
            ) : (
              "Share"
            )}
          </button>
        </div>
      </main>
    </div>
  );
}