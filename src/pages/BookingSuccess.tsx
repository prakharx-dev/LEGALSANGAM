import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
} from "lucide-react";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomID, bookingData } = location.state || {};
  const { toast } = useToast();

  useEffect(() => {
    if (!bookingData) {
      navigate("/find");
    }
  }, [bookingData, navigate]);

  if (!bookingData) {
    return null;
  }

  const handleStartVideo = () => {
    if (roomID && bookingData) {
      navigate("/video-call", { state: { roomID, bookingData } });
    }
  };

  const shareUrl = `${window.location.origin}/video-call?roomID=${roomID}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description:
          "Share this link with your lawyer to join the consultation.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/find")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lawyers
          </Button>
        </div>

        <div className="text-center space-y-4 mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Booking confirmed
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Your consultation has been successfully reserved with{" "}
              {bookingData.lawyer.name}.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <Card className="animate-slide-up overflow-hidden border border-border/80 bg-card shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center text-xl">
                <User className="w-5 h-5 mr-2 text-emerald-600" />
                Consultation summary
              </CardTitle>
              <CardDescription>
                Review the details of your upcoming legal consultation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {bookingData.lawyer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {bookingData.lawyer.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {bookingData.lawyer.specialty}
                    </Badge>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Confirmed
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{bookingData.date}</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-3 flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{bookingData.time}</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-3 flex items-start gap-3 sm:col-span-2">
                  <Video className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Meeting type</p>
                    <p className="font-medium">
                      {bookingData.type || "Video Consultation"} ·{" "}
                      {bookingData.duration || "60 minutes"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment summary
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Invoice ID: {roomID}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Consultation fee</span>
                    <span>₹{bookingData.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee</span>
                    <span>₹{bookingData.platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span>₹{bookingData.gst}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <span>Total paid</span>
                    <span>₹{bookingData.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card
              className="animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Video className="w-5 h-5 mr-2 text-primary" />
                  Start consultation
                </CardTitle>
                <CardDescription>
                  Join the video room when you are ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Room ID</p>
                  <p className="mt-1 font-mono text-base text-foreground">
                    {roomID}
                  </p>
                </div>

                <Button onClick={handleStartVideo} className="w-full" size="lg">
                  <Video className="w-4 h-4 mr-2" />
                  Join video call
                </Button>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Test your mic and camera before joining.</p>
                  <p>• Keep a stable internet connection available.</p>
                  <p>• You can leave and return to the room anytime.</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Share2 className="w-5 h-5 mr-2 text-primary" />
                  Share meeting link
                </CardTitle>
                <CardDescription>
                  Send the link to the lawyer or keep it handy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the copied link to join this consultation from the same
                  room.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
