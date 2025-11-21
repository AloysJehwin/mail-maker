"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Photo {
  id: number;
  user_email: string;
  image_url: string;
  ai_comment: string;
  emoji?: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPhotos();
    }
  }, [status]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Photo Gallery
              </h1>
              <p className="text-sm text-white/80 mt-1">All captured photos</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-white/20 backdrop-blur text-white px-4 sm:px-6 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all text-sm sm:text-base"
              >
                Camera
              </button>
              <button
                onClick={() => signOut()}
                className="bg-red-500/90 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/95 backdrop-blur rounded-3xl p-12 max-w-md mx-auto">
              <svg className="w-20 h-20 text-indigo-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-2xl font-bold text-gray-900 mb-2">No Photos Yet</p>
              <p className="text-gray-600 mb-6">Start capturing memories!</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
              >
                Open Camera
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[9/16] bg-gray-200">
                  <img
                    src={photo.image_url}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                  {photo.emoji && (
                    <div className="absolute bottom-3 right-3 text-4xl drop-shadow-2xl">
                      {photo.emoji}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* AI Comment */}
                  {photo.ai_comment && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg p-3 mb-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 italic line-clamp-3">
                        "{photo.ai_comment}"
                      </p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p className="flex items-center gap-2 truncate">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="truncate">{photo.user_email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(photo.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
