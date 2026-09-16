import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  Globe,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Video,
} from "lucide-react";
import Rating from "@/pages/Rating";
import type { LawyerProfile } from "@/types/lawyer";

const LawyerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lawyer = location.state?.lawyer as LawyerProfile | undefined;

  if (!lawyer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 text-white">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
            Profile unavailable
          </p>
          <h1 className="mt-4 text-3xl font-bold">
            We could not find that advocate.
          </h1>
          <Button
            onClick={() => navigate("/find")}
            className="mt-8 bg-[#e8d05b] text-black hover:bg-[#f2df72]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Find Lawyers
          </Button>
        </div>
      </div>
    );
  }

  const handleVideoCall = () => navigate("/video-call", { state: { lawyer } });
  const handleBooking = () => navigate("/booking", { state: { lawyer } });

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate("/find")}
              className="inline-flex items-center text-sm text-white/45 transition-colors hover:text-[#e8d05b]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to advocates
            </button>

            <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr_auto] lg:items-end">
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={lawyer.image}
                  alt={lawyer.name}
                  className="h-52 w-52 rounded-full border-4 border-[#e8d05b]/35 object-cover shadow-[0_0_60px_rgba(232,208,91,0.12)]"
                />
                {lawyer.verified && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#e8d05b] px-3 py-1.5 text-xs font-bold text-black">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>
                )}
              </div>

              <div className="text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Badge className="border border-[#e8d05b]/35 bg-[#e8d05b]/10 text-[#e8d05b]">
                    {lawyer.specialty}
                  </Badge>
                  <span
                    className={`flex items-center gap-2 text-sm ${lawyer.available ? "text-emerald-400" : "text-white/40"}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${lawyer.available ? "bg-emerald-400" : "bg-white/25"}`}
                    />
                    {lawyer.available
                      ? "Available for consultations"
                      : "Currently unavailable"}
                  </span>
                </div>
                <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                  {lawyer.name}
                </h1>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/50 lg:justify-start">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#e8d05b]" />
                    {lawyer.location}
                  </span>
                  <span>{lawyer.experience} experience</span>
                  <span className="flex items-center gap-2">
                    <Rating value={lawyer.rating} />
                    {lawyer.reviews} reviews
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  disabled={!lawyer.available}
                  onClick={handleBooking}
                  className="bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book consultation
                </Button>
                <Button
                  onClick={handleVideoCall}
                  variant="outline"
                  className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Start video call
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:py-14">
          <div className="space-y-8">
            <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                About this advocate
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">
                {lawyer.description}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
                {[
                  [lawyer.experience, "Experience"],
                  [`${lawyer.successRate}%`, "Success rate"],
                  [String(lawyer.consultations), "Consultations"],
                  [lawyer.rating.toFixed(1), "Rating"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-[#111111] p-4">
                    <p className="text-2xl font-semibold text-[#e8d05b]">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-white/40">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#e8d05b]" />
                <h2 className="text-xl font-semibold">What you can discuss</h2>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="border border-white/10 p-4 text-sm text-white/60">
                  Understand your options and likely next steps
                </div>
                <div className="border border-white/10 p-4 text-sm text-white/60">
                  Review documents and prepare for a consultation
                </div>
                <div className="border border-white/10 p-4 text-sm text-white/60">
                  Discuss timelines, fees, and practical expectations
                </div>
                <div className="border border-white/10 p-4 text-sm text-white/60">
                  Get guidance tailored to your legal situation
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-[#111111] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Languages className="h-5 w-5 text-[#e8d05b]" />
                <h2 className="text-xl font-semibold">Languages</h2>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {lawyer.languages.map((language) => (
                  <Badge
                    key={language}
                    className="border-white/15 bg-white/5 px-3 py-1 text-white/60"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-[#e8d05b]/30 bg-[#e8d05b]/10 p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Consultation fee
              </p>
              <p className="mt-4 text-4xl font-bold text-white">
                {lawyer.fees}
              </p>
              <p className="mt-2 text-sm text-white/45">Per consultation</p>
              <div className="mt-7 border-t border-[#e8d05b]/20 pt-5 text-sm text-white/60">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#e8d05b]" />
                  Choose a time that works for you
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#e8d05b]" />
                  Secure booking through LegalSangam
                </div>
              </div>
              <Button
                onClick={handleBooking}
                disabled={!lawyer.available}
                className="mt-7 w-full bg-[#e8d05b] text-black hover:bg-[#f2df72]"
              >
                Reserve a consultation <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </section>

            <section className="border border-white/10 bg-[#111111] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Contact details
              </p>
              <div className="mt-5 space-y-4 text-sm">
                {lawyer.phone ? (
                  <a
                    href={`tel:${lawyer.phone}`}
                    className="flex items-center gap-3 text-white/60 transition-colors hover:text-[#e8d05b]"
                  >
                    <Phone className="h-4 w-4 text-[#e8d05b]" />
                    {lawyer.phone}
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-white/35">
                    <Phone className="h-4 w-4" />
                    Phone available after booking
                  </div>
                )}
                {lawyer.website ? (
                  <a
                    href={lawyer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-white/60 transition-colors hover:text-[#e8d05b]"
                  >
                    <Globe className="h-4 w-4 text-[#e8d05b]" />
                    Visit website
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-white/35">
                    <Globe className="h-4 w-4" />
                    Website not listed
                  </div>
                )}
                <div className="flex items-center gap-3 text-white/35">
                  <Award className="h-4 w-4 text-[#e8d05b]" />
                  Profile information verified where marked
                </div>
              </div>
            </section>
          </aside>
        </section>

        <section className="border-t border-white/10 bg-[#e8d05b] text-black">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/55">
                Ready to talk?
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Bring your questions. Leave with a clearer next step.
              </h2>
            </div>
            <Button
              onClick={handleBooking}
              disabled={!lawyer.available}
              className="self-start bg-black text-[#e8d05b] hover:bg-black/80 md:self-auto"
            >
              Book with {lawyer.name} <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LawyerDetails;
