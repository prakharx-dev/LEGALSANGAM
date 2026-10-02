import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Maximize2, Minimize2, Video } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type JitsiMeetApi = {
  addEventListener: (event: string, callback: () => void) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>,
    ) => JitsiMeetApi;
  }
}

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || "8x8.vc";
const JITSI_APP_ID =
  import.meta.env.VITE_JITSI_APP_ID ||
  "vpaas-magic-cookie-4642d473f1164ba292e3be3f415f9c5c";

const loadJitsiMeetApi = () => {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://${JITSI_DOMAIN}/${JITSI_APP_ID}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Jitsi Meet failed to load"));
    document.head.appendChild(script);
  });
};

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<JitsiMeetApi | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [loadError, setLoadError] = useState("");

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const bookingData = location.state?.bookingData;

  const params = new URLSearchParams(location.search);
  const paramRoomID = params.get("roomID");
  const stateRoomID = location.state?.roomID;
  const effectiveRoomID =
    paramRoomID || (typeof stateRoomID === "string" ? stateRoomID : "");

  useEffect(() => {
    if (!effectiveRoomID) return;

    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("roomID") === effectiveRoomID) return;

    searchParams.set("roomID", effectiveRoomID);
    navigate(
      { pathname: location.pathname, search: `?${searchParams.toString()}` },
      { replace: true, state: location.state },
    );
  }, [
    effectiveRoomID,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  const copyInviteLink = async () => {
    const inviteUrl = new URL("/video-call", window.location.origin);
    inviteUrl.searchParams.set("roomID", effectiveRoomID);

    try {
      await navigator.clipboard.writeText(inviteUrl.toString());
      toast({
        title: "Invite link copied",
        description: "Share it with the other participant to join this room.",
      });
    } catch {
      toast({
        title: "Could not copy invite link",
        description: "Clipboard access is unavailable in this browser.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!effectiveRoomID) {
      navigate("/find");
      return;
    }

    let disposed = false;
    let api: JitsiMeetApi | null = null;

    const handleCallEnd = () => {
      if (disposed) return;
      navigate("/booking-success", {
        replace: true,
        state: { roomID: effectiveRoomID, bookingData },
      });
    };

    const initializeVideoCall = async () => {
      if (!containerRef.current) return;

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        await loadJitsiMeetApi();
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) {
          return;
        }

        api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: `${JITSI_APP_ID}/legal-sangam-${effectiveRoomID}`,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: {
            displayName:
              user.displayName ||
              user.email?.split("@")[0] ||
              "Legal Sangam user",
          },
          configOverwrite: {
            prejoinConfig: { enabled: false },
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          },
        });
        jitsiApiRef.current = api;
        api.addEventListener("videoConferenceJoined", () => setHasJoined(true));
        api.addEventListener("videoConferenceLeft", handleCallEnd);
        api.addEventListener("readyToClose", handleCallEnd);
      } catch (error) {
        console.error("Jitsi Meet failed to initialize:", error);
        if (!disposed) {
          setLoadError(
            "Unable to load the video room. Please try again later.",
          );
        }
      }
    };

    void initializeVideoCall();

    return () => {
      disposed = true;
      api?.dispose();
      jitsiApiRef.current = null;
    };
  }, [bookingData, effectiveRoomID, navigate, user]);

  if (!effectiveRoomID) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0c1013] text-white">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
        <header className="flex shrink-0 flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#e8d05b]">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold sm:text-xl">
                Video consultation
              </h1>
              <p className="truncate text-sm text-white/55">
                {bookingData?.lawyer?.name
                  ? `With ${bookingData.lawyer.name}`
                  : "Consultation room"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    hasJoined
                      ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15"
                      : "bg-amber-500/15 text-amber-200 hover:bg-amber-500/15"
                  }
                >
                  <span
                    className={`mr-2 inline-block h-2 w-2 rounded-full ${hasJoined ? "bg-emerald-400" : "bg-amber-400"}`}
                  />
                  {hasJoined ? "In call" : "Connecting"}
                </Badge>
                <span className="truncate text-xs text-white/50">
                  {bookingData
                    ? `${bookingData.date} · ${bookingData.time}`
                    : `Room ${effectiveRoomID}`}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={copyInviteLink}
              title="Copy invite link"
              aria-label="Copy invite link"
            >
              <Copy className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Copy invite</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        <div
          ref={videoWrapperRef}
          className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-[#090b0d]"
        >
          <div
            ref={containerRef}
            id="jitsi-container"
            className="h-full min-h-0 w-full"
          />

          {loadError && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 p-5">
              <div className="max-w-sm text-center">
                <Video className="mx-auto mb-3 h-8 w-8 text-white/60" />
                <p className="text-sm text-white/80">{loadError}</p>
                <Button
                  variant="outline"
                  className="mt-4 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
