// src/components/ui/SearchBar.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchService } from "@/services/api";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  username: string;
  avatar?: string | null;
  avatarUrl?: string | null;
}

export default function SearchBar() {
  console.log("🔍 SearchBar component rendered");
  
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileSearch, setIsMobileSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      console.log("⚠️ Query empty, skipping search");
      setResults([]);
      setShowDropdown(false);
      return;
    }

    console.log("⏳ Starting debounce timer for:", query);

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        console.log("🔍 Searching for:", query);
        
        const response = await searchService.searchUsers(query);
        console.log("✅ Search response:", response);
        
        // ← FIX: Access users directly from response
        const users = response.users || [];
        
        console.log("📋 Parsed users:", users);
        
        setResults(users);
        setShowDropdown(users.length > 0 || query.length > 0);
      } catch (error) {
        console.error("❌ Search error:", error);
        setResults([]);
        setShowDropdown(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      console.log("🧹 Clearing timeout");
      clearTimeout(timeoutId);
    };
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsMobileSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    console.log("🧹 Clearing search");
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleUserClick = (username: string) => {
    console.log("👆 User clicked:", username);
    setShowDropdown(false);
    setIsMobileSearch(false);
    setQuery("");
    router.push(`/profile/${username}`);
  };

  const handleMobileSearchClick = () => {
    console.log("📱 Mobile search opened");
    setIsMobileSearch(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Desktop Search */}
      <div className="hidden md:block relative flex-1 max-w-[812px]" ref={dropdownRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            console.log("⌨️ Input changed:", e.target.value);
            setQuery(e.target.value);
          }}
          onFocus={() => {
            console.log("🎯 Input focused");
            if (query) setShowDropdown(true);
          }}
          placeholder="Search users..."
          className="w-full h-12 bg-[#121212] border border-white/5 rounded-xl py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[400px] overflow-y-auto z-50">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white font-semibold mb-1">No results found</p>
                <p className="text-zinc-400 text-sm">Try searching for a different username</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((user) => {
                  const avatarUrl = user.avatarUrl || user.avatar;
                  
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user.username)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                        {avatarUrl ? (
                          <Image 
                            src={avatarUrl} 
                            alt={user.name} 
                            width={40} 
                            height={40} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-white font-bold text-sm">
                              {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold text-sm">{user.name}</p>
                        <p className="text-zinc-400 text-xs">@{user.username}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Icon */}
      <button
        onClick={handleMobileSearchClick}
        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Mobile Search Overlay */}
      {isMobileSearch && (
        <div className="md:hidden fixed inset-0 bg-black z-[100]">
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="relative flex-1" ref={dropdownRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  console.log("⌨️ Mobile input changed:", e.target.value);
                  setQuery(e.target.value);
                }}
                placeholder="Search users..."
                className="w-full h-12 bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-500"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                console.log("❌ Mobile search closed");
                setIsMobileSearch(false);
                setQuery("");
                setShowDropdown(false);
              }}
              className="text-white font-medium"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Results */}
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : query && results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-white font-semibold mb-1 text-lg">No results found</p>
                <p className="text-zinc-400">Try searching for a different username</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((user) => {
                  const avatarUrl = user.avatarUrl || user.avatar;
                  
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user.username)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                        {avatarUrl ? (
                          <Image 
                            src={avatarUrl} 
                            alt={user.name} 
                            width={48} 
                            height={48} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-white font-bold">
                              {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-zinc-400 text-sm">@{user.username}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}