import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Maximize2,
  Minimize2,
  Video,
  ShieldCheck,
  CalendarClock,
  Mic,
  Camera,
} from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoMessage, setDemoMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const demoStreamRef = useRef<MediaStream | null>(null);
  const streamRequestIdRef = useRef(0);

  const toggleFullscreen = () => {
    if (!videoWrapperRef.current) return;

    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const stopDemoStream = () => {
    streamRequestIdRef.current += 1;

    if (demoStreamRef.current) {
      demoStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      demoStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
      localVideoRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.querySelectorAll("video").forEach((videoElement) => {
        videoElement.pause();
        videoElement.srcObject = null;
      });
      containerRef.current.innerHTML = "";
    }
  };

  const endCall = () => {
    setCallEnded(true);
    stopDemoStream();

    if (zpRef.current) {
      try {
        zpRef.current.destroy();
      } catch (error) {
        console.warn("Zego destroy failed on end call:", error);
      }
      zpRef.current = null;
    }

    navigate("/booking-success", {
      replace: true,
      state: {
        roomID: effectiveRoomID,
        bookingData,
      },
    });
  };

  const toggleMic = () => {
    setIsMuted((prev) => !prev);
    if (demoStreamRef.current) {
      demoStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
    if (demoStreamRef.current) {
      demoStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePageHidden = () => {
      if (document.visibilityState === "hidden") {
        stopDemoStream();
      }
    };

    const handleBeforeUnload = () => {
      stopDemoStream();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handlePageHidden);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handlePageHidden);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
    };
  }, []);

  const bookingData = location.state?.bookingData;

  // Extract roomID from URL params or state
  const params = new URLSearchParams(location.search);
  const paramRoomID = params.get("roomID");
  const roomID =
    paramRoomID ||
    location.state?.roomID ||
    Math.floor(Math.random() * 10000) + "";
  const effectiveRoomID = roomID;

  useEffect(() => {
    if (!effectiveRoomID) {
      navigate("/find");
      return;
    }

    const initializeVideoCall = async () => {
      if (!containerRef.current) return;

      if (callEnded) return;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userID = Math.floor(Math.random() * 10000) + "";
        const userName = "userName" + userID;
        const getToken = httpsCallable(functions, "generateZegoToken");
        const tokenResult = await getToken({
          roomID: effectiveRoomID,
          userID,
          userName,
        });
        const data = tokenResult.data as {
          token?: string;
          demoMode?: boolean;
          message?: string;
        };

        if (data?.demoMode || !data?.token) {
          setIsDemoMode(true);
          setDemoMessage(
            data?.message ||
              "Video calling is running in demo mode because live Zego credentials are not configured yet.",
          );
          return;
        }

        if (!window.ZegoUIKitPrebuilt) {
          const script = document.createElement("script");
          script.src =
            "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Zego SDK failed to load"));
            document.head.appendChild(script);
          });
        }

        if (!window.ZegoUIKitPrebuilt || !containerRef.current) return;

        setIsDemoMode(false);
        setDemoMessage("");

        zpRef.current = window.ZegoUIKitPrebuilt.create(data.token);
        zpRef.current.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: "Personal link",
              url:
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname +
                "?roomID=" +
                effectiveRoomID,
            },
          ],
          scenario: {
            mode: window.ZegoUIKitPrebuilt.VideoConference,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showTextChat: true,
          showUserList: true,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
          showJoinConfirmDialog: false,
          onJoinRoom: () => {
            setHasJoined(true);
          },
          onLeaveRoom: () => {
            setHasJoined(false);
          },
        });
      } catch (error) {
        console.warn("Falling back to demo video mode:", error);
        setIsDemoMode(true);
        setDemoMessage(
          "Live video backend is unavailable right now, so the room is running in demo mode.",
        );
      }
    };

    void initializeVideoCall();

    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (error) {
          console.warn("Zego destroy failed on unmount:", error);
        }
        zpRef.current = null;
      }
      stopDemoStream();
    };
  }, [callEnded, effectiveRoomID, navigate, user]);

  useEffect(() => {
    if (!isDemoMode || !containerRef.current || callEnded) return;

    const streamDemoLocalVideo = async () => {
      const requestId = ++streamRequestIdRef.current;

      try {
        stopDemoStream();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (
          requestId !== streamRequestIdRef.current ||
          callEnded ||
          !containerRef.current
        ) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        demoStreamRef.current = stream;

        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;padding:24px;gap:16px;">
              <div style="display:flex;align-items:center;justify-content:center;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);font-size:42px;">🎥</div>
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:700;margin-bottom:8px;">Demo consultation room</div>
                <div style="font-size:14px;opacity:0.8;max-width:420px;line-height:1.6;">${demoMessage || "The live video backend is not configured yet, so this is a local demo mode for testing the flow."}</div>
              </div>
              <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;">
                <div style="padding:8px 14px;border-radius:999px;background:rgba(16,185,129,0.18);border:1px solid rgba(16,185,129,0.4);font-size:12px;">Room ID: ${effectiveRoomID}</div>
                <div style="padding:8px 14px;border-radius:999px;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.3);font-size:12px;">Local preview active</div>
              </div>
              <div style="width:min(520px,90%);aspect-ratio:16/9;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:#020817;box-shadow:0 20px 50px rgba(15,23,42,0.4);">
                <video id="demo-local-video" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;"></video>
              </div>
            </div>
          `;

          const videoElement = containerRef.current?.querySelector(
            "#demo-local-video",
          ) as HTMLVideoElement | null;
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.muted = true;
            localVideoRef.current = videoElement;
          }
        }
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#020817,#111827);color:white;padding:24px;text-align:center;gap:12px;">
              <div style="font-size:42px;">📹</div>
              <div style="font-size:28px;font-weight:700;">Demo room ready</div>
              <div style="font-size:14px;opacity:0.8;max-width:440px;line-height:1.6;">${demoMessage || "Camera access is blocked, but the room is available for demo testing."}</div>
              <div style="padding:8px 14px;border-radius:999px;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.3);font-size:12px;">Room ID: ${effectiveRoomID}</div>
            </div>
          `;
        }
      }
    };

    void streamDemoLocalVideo();

    return () => {
      stopDemoStream();
    };
  }, [callEnded, demoMessage, effectiveRoomID, isDemoMode]);

  if (!effectiveRoomID) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex flex-col">
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-7xl">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Video consultation
              </h1>
              <p className="text-sm text-muted-foreground">
                {bookingData?.lawyer?.name
                  ? `Connected with ${bookingData.lawyer.name}`
                  : "Consultation room"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Card className="border-border/80 bg-card/90 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Secure consultation</span>
              </div>
            </Card>

            <Card className="border-border/80 bg-card/90 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                <span>
                  {bookingData
                    ? `${bookingData.date} • ${bookingData.time}`
                    : `Room ${effectiveRoomID}`}
                </span>
              </div>
            </Card>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2" />
            Live
          </Badge>
          <Badge variant="outline">Room ID: {effectiveRoomID}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Mic on
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            Camera on
          </Badge>
        </div>

        <div
          ref={videoWrapperRef}
          className="relative flex-1 rounded-2xl border border-border/80 bg-slate-950/95 shadow-2xl shadow-slate-900/10 overflow-hidden min-h-[420px] h-[70vh] md:h-[75vh]"
        >
          <div
            ref={containerRef}
            id="zego-container"
            className="w-full h-full min-h-[420px]"
          ></div>

          {hasJoined && !isDemoMode && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <p className="mt-16 text-sm font-medium tracking-[0.25em] text-white/45 uppercase">
                Legal Sangam confidential
              </p>
            </div>
          )}

          {isDemoMode && !callEnded && (
            <div className="absolute bottom-4 left-1/2 z-20 w-[min(440px,90%)] -translate-x-1/2">
              <div className="flex items-center justify-center gap-3 rounded-full border border-white/10 bg-slate-950/70 p-2 shadow-lg backdrop-blur-sm">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition ${
                    isMuted
                      ? "border-red-500/50 bg-red-500/15 text-red-200"
                      : "border-white/10 bg-white/5 text-white"
                  }`}
                  aria-label="Toggle microphone"
                >
                  {isMuted ? "🔇" : "🎤"}
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition ${
                    isCameraOn
                      ? "border-white/10 bg-white/5 text-white"
                      : "border-amber-500/50 bg-amber-500/15 text-amber-200"
                  }`}
                  aria-label="Toggle camera"
                >
                  {isCameraOn ? "📷" : "🚫"}
                </button>
                <button
                  type="button"
                  onClick={endCall}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400"
                  aria-label="End call"
                >
                  ✖
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
