import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'localhost',
      // Tambahkan domain lain jika diperlukan
    ],
    // Atau jika menggunakan Next.js 13+ dengan remotePatterns (recommended)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
