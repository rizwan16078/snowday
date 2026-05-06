"use client";

import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-white/60 mb-8">The page you are looking for does not exist.</p>
      <Link 
        href="/"
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
