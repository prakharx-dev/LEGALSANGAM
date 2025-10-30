import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

const VideoCall = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);

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

    const initializeVideoCall = () => {
      if (!window.ZegoUIKitPrebuilt || !containerRef.current) return;

      const userID = Math.floor(Math.random() * 10000) + "";
      const userName = "userName" + userID;
      const appID = 588617023;
      const serverSecret = "dd262916d68e648b919e3724c20353b9";
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        effectiveRoomID,
        userID,
        userName
      );

      zpRef.current = window.ZegoUIKitPrebuilt.create(kitToken);
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
      });
    };

    // Load Zego script if not already loaded
    if (!window.ZegoUIKitPrebuilt) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
      script.onload = initializeVideoCall;
      document.head.appendChild(script);
    } else {
      initializeVideoCall();
    }

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [effectiveRoomID, navigate]);

  if (!effectiveRoomID) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Video Consultation</h1>
              <p className="text-muted-foreground">
                {bookingData?.lawyer?.name
                  ? `Connected with ${bookingData.lawyer.name}`
                  : "Consultation Room"}
              </p>
            </div>
          </div>
          <Card className="p-4">
            <div className="text-sm">
              <div>Room ID: {effectiveRoomID}</div>
              {bookingData && (
                <div>
                  {bookingData.date} at {bookingData.time}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Video Container */}
        <div className="relative w-full h-[calc(100vh-200px)] rounded-lg overflow-hidden">
          <div ref={containerRef} className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
