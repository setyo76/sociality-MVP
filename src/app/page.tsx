"use client"; // Wajib karena menggunakan hooks (useEffect, useRouter, useSelector)

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store"; // Pastikan Anda membuat store (lihat langkah 2 di bawah)

export default function Home() {
  const router = useRouter();
  
  // Ambil token dari Redux state
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Logika routing sederhana:
    // 1. Jika user belum login (token kosong), arahkan ke Login.
    // 2. Jika sudah login, nanti bisa arahkan ke /feed.
    
    if (!token) {
      router.push("/login");
    } else {
      // Nanti setelah halaman Feed dibuat, uncomment baris di bawah:
      // router.push("/feed");
      
      // Sementara ini, jika ada token tetap stay di home atau redirect ke feed
      console.log("User is logged in"); 
    }
  }, [token, router]);

  // Tampilkan Loading Spinner sementara proses redirect berjalan
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="text-center space-y-4">
        {/* Loading Spinner */}
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
        <p className="text-zinc-400 text-sm animate-pulse">Loading Sociality...</p>
      </div>
    </div>
  );
}