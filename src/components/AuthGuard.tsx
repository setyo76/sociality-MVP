// src/components/AuthGuard.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getCurrentUser } from '@/store/slices/authSlice';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const hasChecked = useRef(false);
  
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  // Daftar halaman publik
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPage = publicPaths.includes(pathname);

  // Effect untuk cek session - hanya sekali
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isAuthenticated && !hasChecked.current) {
      hasChecked.current = true;
      console.log('🔍 Checking session with token');
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Effect untuk handle redirect
  useEffect(() => {
    // Jangan lakukan apa-apa jika masih loading
    if (isLoading) return;

    const token = localStorage.getItem('token');

    // Jika halaman publik, tampilkan langsung
    if (isPublicPage) {
      // Jika sudah login dan mencoba akses login/register, redirect ke feed
      if (token && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        router.push('/feed');
      }
      return;
    }

    // Jika halaman privat
    if (!token) {
      console.log('🚫 No token, redirecting to login');
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
    } else if (!isAuthenticated && !isLoading) {
      console.log('🚫 Not authenticated, redirecting to login');
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, isPublicPage, pathname, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Untuk halaman publik, render children
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Untuk halaman privat, render hanya jika authenticated
  return isAuthenticated ? <>{children}</> : null;
}