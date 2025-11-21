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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🎨 Admin Gallery
              </h1>
              <p className="text-sm text-gray-600 mt-1">All captured selfies & AI roasts</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                📸 Take Selfie
              </button>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No selfies yet! 📸</p>
            <p className="text-gray-400 mt-2">Start taking some fun photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[9/16] bg-gray-100">
                  <img
                    src={photo.image_url}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  {photo.emoji && (
                    <div className="absolute bottom-4 right-4 text-5xl drop-shadow-lg">
                      {photo.emoji}
                    </div>
                  )}
                </div>

                {/* AI Comment */}
                <div className="p-5">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-3">
                    <p className="text-sm font-semibold text-gray-800 italic">
                      💬 "{photo.ai_comment}"
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">👤</span>
                      {photo.user_email}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">📅</span>
                      {new Date(photo.created_at).toLocaleString()}
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
