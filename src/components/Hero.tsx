import { ArrowRight, Bot, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-[#0b0b0b] text-white">
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-25"
        autoPlay
        loop
        muted
        playsInline
        src="/1.mp4"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(232,208,91,0.16),transparent_35%),linear-gradient(110deg,#0b0b0b_30%,rgba(11,11,11,0.72),#0b0b0b)]" />
      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <div>
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
            <ShieldCheck className="h-4 w-4" />
            Legal help, made human
          </div>
          <h1 className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Find the right legal help for what comes next.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
            Compare trusted advocates, understand your options, and book a
            consultation without having to navigate the legal system alone.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/find"
              className="inline-flex items-center bg-[#e8d05b] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#f2df72]"
            >
              Find an advocate <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/ai-legal-assistant"
              className="inline-flex items-center border border-white/20 bg-black/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Ask the AI assistant{" "}
              <Bot className="ml-2 h-4 w-4 text-[#e8d05b]" />
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/45">
            <span>5,000+ advocates</span>
            <span>25 cities</span>
            <span>8+ languages</span>
          </div>
        </div>
        <div className="border border-white/15 bg-[#111111]/80 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex items-center gap-3 text-[#e8d05b]">
            <Search className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Start with your situation
            </span>
          </div>
          <p className="mt-7 text-3xl font-semibold leading-tight">
            You do not need to know the legal term first.
          </p>
          <p className="mt-4 leading-7 text-white/50">
            Search by what happened, where you are, or the kind of help you
            need. We will help you get oriented.
          </p>
          <Link
            to="/find"
            className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-sm font-semibold text-[#e8d05b]"
          >
            Explore advocates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
