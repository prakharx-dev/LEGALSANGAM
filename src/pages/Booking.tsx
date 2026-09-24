import React, { useMemo, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react";

const consultationOptions = [
  {
    id: "phone",
    label: "Phone consultation",
    durationMinutes: 30,
    multiplier: 0.85,
    description: "Quick legal guidance over a call",
  },
  {
    id: "video",
    label: "Video consultation",
    durationMinutes: 60,
    multiplier: 1,
    description: "Face-to-face online session with document review",
  },
  {
    id: "in-person",
    label: "In-person meeting",
    durationMinutes: 90,
    multiplier: 1.35,
    description: "Extended office consultation for detailed advice",
  },
] as const;

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
  const lawyer = location.state?.lawyer;

  const [selectedConsultation, setSelectedConsultation] = useState(
    consultationOptions[1],
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    getNextAvailableDate(),
  );
  const [selectedTime, setSelectedTime] = useState("");

  if (!lawyer) {
    navigate("/find");
    return null;
  }

  const availableSlots = useMemo(
    () => getAvailableSlots(selectedDate, lawyer.id),
    [selectedDate, lawyer.id],
  );

  const baseFee = parseFees(lawyer.fees || "₹999/consultation");
  const pricing = getPriceBreakdown(baseFee, selectedConsultation.multiplier);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;

    const bookingData = {
      lawyer,
      date: selectedDate.toLocaleDateString(),
      time: selectedTime,
      duration: `${selectedConsultation.durationMinutes} minutes`,
      type: selectedConsultation.label,
      fee: pricing.consultationFee,
      platformFee: pricing.platformFee,
      gst: pricing.gst,
      total: pricing.total,
    };

    navigate("/payments", { state: { bookingData } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <div className="text-center space-y-4 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/find")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lawyers
          </Button>
          <h1 className="text-4xl font-bold text-foreground">
            Book Consultation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a consultation format, preferred date, and time with{" "}
            {lawyer.name}.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Select consultation format
                </CardTitle>
                <CardDescription>
                  Choose the booking type that matches the kind of advice you
                  need.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {consultationOptions.map((option) => {
                    const isSelected = selectedConsultation.id === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setSelectedConsultation(option);
                          setSelectedTime("");
                        }}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-input hover:border-primary/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>
                            {option.durationMinutes} min
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Select Date</label>
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
                    className="rounded-md border"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-4 animate-fade-in">
                    <label className="text-sm font-medium">Select Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => {
                        const time = formatTimeLabel(slot);
                        const isSelected = selectedTime === time;

                        return (
                          <Button
                            key={time}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="justify-start"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className="animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <CardHeader>
                <CardTitle>Lawyer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {lawyer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{lawyer.name}</h3>
                    <Badge variant="secondary">{lawyer.specialty}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span>{lawyer.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span>
                      {lawyer.rating} ({lawyer.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fee</span>
                    <span className="font-medium">{lawyer.fees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(selectedDate || selectedTime) && (
              <Card
                className="animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span>{selectedDate?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{selectedConsultation.durationMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{selectedConsultation.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Consultation fee
                    </span>
                    <span>₹{pricing.consultationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span>₹{pricing.platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST</span>
                    <span>₹{pricing.gst}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{pricing.total}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
