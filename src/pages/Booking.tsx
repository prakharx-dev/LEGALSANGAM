import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import {
  createRazorpayOrder,
  handlePaymentSuccess,
  initiateRazorpayPayment,
  verifyRazorpayPayment,
} from "@/services/paymentService";
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowLeft,
  Video,
} from "lucide-react";

const videoConsultation = {
  label: "Video consultation",
  durationMinutes: 60,
  multiplier: 1,
};

const getNextAvailableDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);

  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  if (date.getDay() === 6) date.setDate(date.getDate() + 2);

  return date;
};

const parseFees = (fees: string) => {
  const match = fees.match(/\d+/g);
  if (!match) return 0;
  return Number(match.join(""));
};

const formatTimeLabel = (date: Date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getPriceBreakdown = (baseFee: number, multiplier: number) => {
  const consultationFee = Math.round(baseFee * multiplier);
  const platformFee = Math.round(consultationFee * 0.08);
  const gst = Math.round((consultationFee + platformFee) * 0.18);
  const total = consultationFee + platformFee + gst;

  return { consultationFee, platformFee, gst, total };
};

const getAvailableSlots = (selectedDate: Date, lawyerId?: string | number) => {
  const date = new Date(selectedDate);
  const day = date.getDay();
  const baseSlots = day === 0 || day === 6 ? [10, 12, 15, 17] : [9, 11, 14, 17];
  const offset = typeof lawyerId === "number" ? lawyerId % 2 : 0;
  const slots: Date[] = [];

  baseSlots.forEach((hour, index) => {
    const slot = new Date(date);
    const minute = (index + offset) % 2 === 0 ? 0 : 30;
    slot.setHours(hour, minute, 0, 0);

    const now = new Date();
    if (slot.getTime() <= now.getTime()) return;

    slots.push(slot);
  });

  return slots.slice(0, 4);
};

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, username } = useAuth();
  const lawyer = location.state?.lawyer;

  const [selectedDate, setSelectedDate] = useState<Date>(
    getNextAvailableDate(),
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  if (!lawyer) {
    navigate("/find");
    return null;
  }

  const availableSlots = lawyer
    ? getAvailableSlots(selectedDate, lawyer.id)
    : [];

  const baseFee = parseFees(lawyer.fees || "₹999/consultation");
  const pricing = getPriceBreakdown(baseFee, videoConsultation.multiplier);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || isProcessing) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setPaymentError("");
    setIsProcessing(true);

    try {
      const roomID = window.crypto.randomUUID();
      const order = await createRazorpayOrder({
        receipt: `consult-${Date.now()}`,
        sellerId: String(lawyer.id),
        booking: {
          date: selectedDate.toLocaleDateString(),
          time: selectedTime,
          duration: `${videoConsultation.durationMinutes} minutes`,
          type: videoConsultation.label,
          roomID,
        },
      });

      const paymentResponse = await initiateRazorpayPayment(order, {
        name: user.displayName || username || "Legal Sangam client",
        email: user.email || "",
        contact: user.phoneNumber || "",
      });
      const verifiedPayment = await verifyRazorpayPayment(paymentResponse);

      void handlePaymentSuccess(verifiedPayment.bookingData, user.uid).catch(
        (escrowError) => {
          console.warn(
            "Payment verified; secondary escrow record failed:",
            escrowError,
          );
        },
      );

      navigate("/booking-success", {
        state: {
          roomID: verifiedPayment.bookingData.roomID,
          bookingData: verifiedPayment.bookingData,
        },
      });
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentError(
        error instanceof Error && error.message
          ? error.message
          : "Payment setup failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-4">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b pb-3">
          <div className="min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/find")}
              className="-ml-3 mb-1 h-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to advocates
            </Button>
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              Book video consultation
            </h1>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              With {lawyer.name}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-2 px-3 py-2">
            <Video className="h-4 w-4" />
            {videoConsultation.durationMinutes} min
          </Badge>
        </header>

        <div className="mt-3 grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.85fr)] lg:overflow-hidden">
          <Card className="flex min-w-0 flex-col lg:min-h-0">
            <CardHeader className="shrink-0 px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarIcon className="h-4 w-4" />
                Choose a date and time
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0 lg:min-h-0 lg:flex-1">
              <div className="grid min-w-0 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(17rem,1.1fr)_minmax(12rem,0.9fr)]">
                <div className="flex min-w-0 flex-col gap-1">
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    min={formatDateInput(new Date())}
                    value={formatDateInput(selectedDate)}
                    onChange={(event) => {
                      if (!event.target.value) return;
                      setSelectedDate(
                        new Date(`${event.target.value}T00:00:00`),
                      );
                      setSelectedTime("");
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground md:hidden"
                  />
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date < new Date("1900-01-01")
                    }
                    className="hidden w-full rounded-md border p-2 [&_.rdp-cell]:h-8 [&_.rdp-cell]:w-8 [&_.rdp-day]:h-8 [&_.rdp-day]:w-8 [&_.rdp-head_cell]:w-8 [&_.rdp-month]:space-y-2 [&_.rdp-row]:mt-1 md:block"
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <div>
                    <label className="text-sm font-medium">
                      Available times
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {selectedDate.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                    {availableSlots.map((slot) => {
                      const time = formatTimeLabel(slot);
                      const isSelected = selectedTime === time;

                      return (
                        <Button
                          key={time}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="h-9 justify-center px-2 text-sm lg:justify-start lg:px-3"
                        >
                          <Clock className="mr-1.5 h-4 w-4 shrink-0" />
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="min-w-0 truncate text-sm text-muted-foreground">
                  {selectedTime
                    ? `${selectedDate.toLocaleDateString()} at ${selectedTime}`
                    : "Select an available time to continue"}
                </p>
                {paymentError && (
                  <p className="text-sm text-destructive" role="alert">
                    {paymentError}
                  </p>
                )}
                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || isProcessing}
                  className="w-full shrink-0 sm:w-auto"
                  size="sm"
                >
                  {isProcessing
                    ? "Opening secure checkout..."
                    : "Pay securely with Razorpay"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-w-0 flex-col lg:min-h-0 lg:overflow-y-auto">
            <CardHeader className="shrink-0 px-4 py-3">
              <CardTitle className="text-base">Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4 pt-0 text-sm sm:space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-bold text-primary">
                  {lawyer.name
                    .split(" ")
                    .map((namePart: string) => namePart[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{lawyer.name}</h2>
                  <p className="truncate text-muted-foreground">
                    {lawyer.specialty} · {lawyer.experience}
                  </p>
                </div>
              </div>

              <div className="hidden grid-cols-2 gap-x-3 gap-y-1 border-y py-2 text-xs sm:grid">
                <span className="text-muted-foreground">Rating</span>
                <span className="text-right">
                  {lawyer.rating} ({lawyer.reviews} reviews)
                </span>
                <span className="text-muted-foreground">Location</span>
                <span className="truncate text-right">{lawyer.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:block sm:space-y-1.5">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-right">
                    {selectedDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-right">
                    {selectedTime || "Not selected"}
                  </span>
                </div>
                <div className="hidden justify-between gap-3 sm:flex">
                  <span className="text-muted-foreground">Video session</span>
                  <span>{videoConsultation.durationMinutes} minutes</span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-2 sm:space-y-1.5">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Consultation</span>
                  <span>₹{pricing.consultationFee}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Platform + GST</span>
                  <span>
                    ₹{pricing.platformFee} + ₹{pricing.gst}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>₹{pricing.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
