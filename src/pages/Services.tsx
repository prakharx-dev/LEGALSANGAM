import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  Phone,
  Scale,
  Search,
  Shield,
  Users,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    title: "Criminal law",
    description:
      "Support through bail, defense, appeals, and white-collar matters.",
    icon: Shield,
    features: ["Bail applications", "Criminal defense", "Appeals"],
  },
  {
    title: "Family law",
    description:
      "Steady guidance for divorce, custody, maintenance, and family disputes.",
    icon: Users,
    features: ["Divorce", "Child custody", "Domestic violence"],
  },
  {
    title: "Corporate law",
    description:
      "Practical counsel for contracts, company formation, compliance, and growth.",
    icon: FileText,
    features: ["Contracts", "Company formation", "Compliance"],
  },
  {
    title: "Property law",
    description:
      "Protect your interests in transactions, title checks, and property disputes.",
    icon: Scale,
    features: ["Title verification", "Property disputes", "Real estate"],
  },
  {
    title: "Labour law",
    description:
      "Clear advice for workplace disputes, employment terms, and compliance.",
    icon: Award,
    features: ["Employment disputes", "Termination", "Workplace issues"],
  },
  {
    title: "Consumer protection",
    description:
      "Know your rights when a product or service does not meet its promise.",
    icon: CheckCircle2,
    features: ["Consumer complaints", "Refund claims", "Service disputes"],
  },
];

const consultations = [
  {
    title: "Phone consultation",
    duration: "30 minutes",
    detail: "A focused first conversation from wherever you are.",
    icon: Phone,
  },
  {
    title: "Video consultation",
    duration: "60 minutes",
    detail: "Face-to-face guidance with room for documents and detail.",
    icon: Video,
  },
  {
    title: "In-person meeting",
    duration: "90 minutes",
    detail: "A deeper discussion at an advocate's office.",
    icon: Calendar,
  },
];

const steps = [
  [
    "01",
    "Choose a legal area",
    "Start with the issue closest to your situation.",
  ],
  ["02", "Compare advocates", "Review expertise, location, fees, and ratings."],
  ["03", "Pick a format", "Choose phone, video, or an in-person consultation."],
  [
    "04",
    "Take the next step",
    "Book time and arrive prepared for the conversation.",
  ],
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:px-8 lg:py-14">
            <div>
              <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
                <Scale className="h-4 w-4" />
                Legal services
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl">
                Start with the issue. We will help you find the right path.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
                Explore common legal areas, compare advocates, and choose a
                consultation that fits the way you need help.
              </p>
              <button
                onClick={() => navigate("/find")}
                className="mt-8 inline-flex items-center bg-[#e8d05b] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#f2df72]"
              >
                Search advocates
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="border-l border-[#e8d05b]/40 pl-6 lg:mb-2">
              <Search className="h-6 w-6 text-[#e8d05b]" />
              <p className="mt-6 text-2xl font-semibold leading-tight">
                No legal vocabulary required.
              </p>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Describe what happened in plain language. The right legal area
                is a starting point, not a test.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Find your starting point
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Legal areas
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/45">
              Choose the closest match. Your advocate can help refine the
              question once you connect.
            </p>
          </div>
          <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="group flex min-h-[260px] flex-col bg-[#111111] p-6 transition-colors hover:bg-[#171717] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <service.icon className="h-6 w-6 text-[#e8d05b]" />
                  <span className="text-xs text-white/25">0{index + 1}</span>
                </div>
                <h3 className="mt-12 text-2xl font-semibold">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  {service.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="border border-white/10 px-2.5 py-1 text-[11px] text-white/45"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/find")}
                  className="mt-6 flex items-center text-sm font-semibold text-[#e8d05b] opacity-80 transition-opacity group-hover:opacity-100"
                >
                  Find an advocate <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                  Choose your format
                </p>
                <h2 className="mt-4 text-4xl font-bold leading-tight">
                  Advice should fit your day.
                </h2>
                <p className="mt-5 max-w-sm leading-7 text-white/50">
                  Start with a conversation format that feels comfortable. You
                  can always take the next step later.
                </p>
              </div>
              <div className="grid gap-px bg-white/10 md:grid-cols-3">
                {consultations.map((consultation) => (
                  <button
                    key={consultation.title}
                    onClick={() => navigate("/find")}
                    className="group bg-[#111111] p-6 text-left transition-colors hover:bg-[#1a1a1a]"
                  >
                    <consultation.icon className="h-6 w-6 text-[#e8d05b]" />
                    <h3 className="mt-12 text-xl font-semibold">
                      {consultation.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#e8d05b]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {consultation.duration}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/45">
                      {consultation.detail}
                    </p>
                    <ArrowUpRight className="mt-7 h-4 w-4 text-white/30 transition-colors group-hover:text-[#e8d05b]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                How it works
              </p>
              <h2 className="mt-3 text-4xl font-bold">
                From concern to conversation.
              </h2>
            </div>
            <Globe2 className="h-10 w-10 text-white/15" />
          </div>
          <div className="grid gap-px bg-white/10 md:grid-cols-4">
            {steps.map(([number, title, description]) => (
              <div key={number} className="bg-[#0b0b0b] p-6 sm:p-7">
                <span className="text-sm font-semibold text-[#e8d05b]">
                  {number}
                </span>
                <h3 className="mt-12 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#e8d05b] text-black">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/55">
                Not sure where to begin?
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight">
                Tell us what happened. We will help you find the next move.
              </h2>
            </div>
            <button
              onClick={() => navigate("/ai-legal-assistant")}
              className="inline-flex shrink-0 items-center self-start border border-black/25 px-5 py-3 text-sm font-bold transition-colors hover:bg-black hover:text-[#e8d05b] md:self-auto"
            >
              Ask the AI assistant <ArrowUpRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Services;
