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
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle2,
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  ArrowRight,
  ReceiptText,
  ShieldCheck,
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
    <div className="h-full min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_34rem),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--muted)/0.35))]">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-2 sm:px-6 lg:py-3">
        <div className="mb-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/find")}
            className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lawyers
          </Button>
        </div>

        <div className="mb-3 flex shrink-0 items-center gap-4 rounded-2xl border bg-card/75 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur animate-fade-in sm:px-5">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-4 ring-emerald-500/5">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <Badge className="mb-1 border-0 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-500/10">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Payment confirmed
            </Badge>
            <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
              Booking confirmed
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consultation reserved with {bookingData.lawyer.name}.
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:flex-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)] lg:items-start">
          <Card className="animate-slide-up flex min-w-0 flex-col overflow-hidden border-border/70 bg-card/90 shadow-lg shadow-black/5">
            <CardHeader className="shrink-0 border-b bg-muted/30 px-4 py-3">
              <CardTitle className="flex items-center text-base">
                <User className="mr-2 h-4 w-4 text-emerald-600" />
                Consultation summary
              </CardTitle>
              <CardDescription className="hidden text-xs sm:block">
                Review the details of your upcoming legal consultation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3 rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-sm">
                    {bookingData.lawyer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold leading-tight">
                      {bookingData.lawyer.name}
                    </h3>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {bookingData.lawyer.specialty}
                    </p>
                  </div>
                </div>
                <Badge className="shrink-0 border-0 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                  Confirmed
                </Badge>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{bookingData.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-2.5">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{bookingData.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-2.5 sm:col-span-2 lg:col-span-1">
                  <Video className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Meeting type</p>
                    <p className="font-medium">
                      {bookingData.type || "Video Consultation"} ·{" "}
                      {bookingData.duration || "60 minutes"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="flex items-center text-sm font-semibold text-foreground">
                    <ReceiptText className="mr-2 h-4 w-4 shrink-0 text-primary" />
                    Payment breakdown
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
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
                  <div className="col-span-2 flex justify-between border-t border-border/80 pt-2 text-base font-bold">
                    <span>Total paid</span>
                    <span>₹{bookingData.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 lg:min-h-0">
            <Card
              className="animate-slide-up border-primary/20 bg-card shadow-lg shadow-primary/5"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader className="px-4 py-3">
                <CardTitle className="flex items-center text-base">
                  <Video className="mr-2 h-4 w-4 text-primary" />
                  Start consultation
                </CardTitle>
                <CardDescription className="hidden text-xs sm:block">
                  Join at your scheduled consultation time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 pt-0">
                <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Secure room ID</p>
                  <p className="mt-1 break-all font-mono text-xs leading-relaxed text-foreground">
                    {roomID}
                  </p>
                </div>

                <Button
                  onClick={handleStartVideo}
                  className="w-full shadow-md shadow-primary/20"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join video call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground">
                  Allow camera and microphone access before joining.
                </p>
              </CardContent>
            </Card>

            <Card
              className="animate-slide-up border-border/70 bg-card/80"
              style={{ animationDelay: "200ms" }}
            >
              <CardHeader className="px-4 py-3">
                <CardTitle className="flex items-center text-base">
                  <Share2 className="mr-2 h-4 w-4 text-primary" />
                  Share meeting link
                </CardTitle>
                <CardDescription className="hidden text-xs sm:block">
                  Invite your advocate to join the same room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 pt-0">
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1 break-all rounded-md border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    {shareUrl}
                  </div>
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this full link with your advocate.
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
