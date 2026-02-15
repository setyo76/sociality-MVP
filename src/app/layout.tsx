// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/store/provider';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Social Media App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}