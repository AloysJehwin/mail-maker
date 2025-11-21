"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface GmailProfile {
  emailAddress?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [zoom, setZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Animal emojis for stickers
  const animalEmojis = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
    "🐧", "🐦", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗",
    "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐢",
    "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞",
    "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈",
    "🐊", "🐆", "🐅", "🐃", "🐂", "🐄", "🦌", "🐪",
    "🐫", "🦙", "🦘", "🦏", "🦛", "🐘", "🦒", "🦓"
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchGmailProfile();
    }
  }, [session, status]);

  const fetchGmailProfile = async () => {
    try {
      setLoading(true);
      const profileRes = await fetch("/api/gmail/profile");
      if (!profileRes.ok) {
        if (profileRes.status === 401 || profileRes.status === 403 || profileRes.status === 500) {
          await signOut({ callbackUrl: "/" });
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const profileData = await profileRes.json();
      setProfile(profileData);
    } catch (err) {
      await signOut({ callbackUrl: "/" });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera not supported on this device");
        return;
      }

      // Request high quality portrait mode camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1080, max: 1920 },
          height: { ideal: 1920, max: 3840 },
        },
        audio: false
      });

      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();

            // Apply zoom if supported
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities() as any;
            if (capabilities.zoom) {
              track.applyConstraints({
                advanced: [{ zoom: zoom } as any]
              }).catch(() => {
                // Zoom not supported on this device
              });
            }
          };
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    setShowCamera(false);

    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      if (capabilities.zoom) {
        track.applyConstraints({
          advanced: [{ zoom: newZoom } as any]
        }).catch(() => {
          // Zoom not supported
        });
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // High quality output
    const targetWidth = 1080;
    const targetHeight = 1920;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate object-cover behavior to match preview exactly
    // This ensures captured image matches what user sees in preview
    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = targetWidth / targetHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (videoAspect > canvasAspect) {
      // Video is wider - fit height and crop width (like object-cover)
      drawHeight = targetHeight;
      drawWidth = video.videoWidth * (targetHeight / video.videoHeight);
      offsetX = (targetWidth - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Video is taller - fit width and crop height (like object-cover)
      drawWidth = targetWidth;
      drawHeight = video.videoHeight * (targetWidth / video.videoWidth);
      offsetX = 0;
      offsetY = (targetHeight - drawHeight) / 2;
    }

    // Draw video with object-cover behavior (matches preview)
    context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

    // Add emoji sticker
    if (selectedEmoji) {
      const fontSize = Math.min(canvas.width, canvas.height) * 0.15;
      context.font = `${fontSize}px Arial`;
      const x = canvas.width / 2 - fontSize / 2;
      const y = canvas.height - fontSize - 20;
      context.fillText(selectedEmoji, x, y);
    }

    // Maximum quality JPEG
    const imageData = canvas.toDataURL("image/jpeg", 1.0);
    setCapturedImage(imageData);
    setShowCamera(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const sendPhoto = async () => {
    if (!capturedImage) return;

    setSending(true);

    // Immediate feedback - don't wait for backend
    setCapturedImage(null);
    setSelectedEmoji("");

    // Show success message immediately
    alert("Photo is being processed and will be sent to your email shortly!");

    // Send in background without waiting
    fetch("/api/gmail/send-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData: capturedImage,
        emoji: selectedEmoji
      }),
    }).catch(() => {
      // Silent fail - email might still be sent
    });

    setSending(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setSelectedEmoji("");
    startCamera();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur rounded-3xl p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white">Selfie Mailer</h1>
            <p className="text-xs sm:text-sm text-white/80 truncate">{profile?.emailAddress}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white/90 hover:text-white text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition whitespace-nowrap ml-2"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto p-4">
        {!showCamera && !capturedImage && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="w-full max-w-sm">
              <div className="bg-white/95 backdrop-blur rounded-3xl p-8 text-center shadow-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Capture</h2>
                <p className="text-gray-600 mb-8">Take a photo and send it to your email</p>
                <button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Open Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {showCamera && (
          <div className="flex flex-col items-center min-h-screen justify-center py-4">
            <div className="w-full max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl relative" style={{ aspectRatio: "9 / 16" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Camera Controls Overlay */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleCamera}
                    className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
                    title="Switch Camera"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      setShowCamera(false);
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                      }
                    }}
                    className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Zoom Control */}
                <div className="mt-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">Zoom</span>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <span className="text-white text-sm font-medium">{zoom.toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                {/* Capture Button */}
                <div className="flex justify-center mb-4">
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition active:scale-95 border-4 border-white/50"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Emoji/Sticker Picker */}
            <div className="w-full max-w-md mx-auto mt-4 bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-lg">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 text-center">Add a Sticker (Optional)</p>
              <div className="grid grid-cols-8 gap-1 sm:gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {animalEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji === selectedEmoji ? "" : emoji)}
                    className={`text-xl sm:text-2xl p-1 sm:p-2 rounded-lg transition ${
                      selectedEmoji === emoji
                        ? "bg-indigo-100 scale-110 ring-2 ring-indigo-500"
                        : "hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="flex flex-col items-center min-h-screen justify-center py-4">
            <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto"
                style={{ aspectRatio: "9 / 16", objectFit: "contain" }}
              />
              <div className="p-6 space-y-3">
                <button
                  onClick={sendPhoto}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send to Email"}
                </button>
                <button
                  onClick={retakePhoto}
                  disabled={sending}
                  className="w-full bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
