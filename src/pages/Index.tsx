import Hero from "@/components/Hero";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { lawyers } from "@/data/lawyers";

const legalAreas = [
  ["Family law", "Divorce, custody, and matrimonial matters", Users],
  ["Criminal law", "Defense, bail, and criminal litigation", ShieldCheck],
  ["Property law", "Title checks, disputes, and real estate", Scale],
  ["Corporate law", "Contracts, formation, and compliance", FileText],
];

const steps = [
  [
    "01",
    "Describe your situation",
    "Start with a plain-language question or legal area.",
  ],
  [
    "02",
    "Compare advocates",
    "Review expertise, location, fees, ratings, and availability.",
  ],
  [
    "03",
    "Book your conversation",
    "Choose phone, video, or in-person guidance.",
  ],
];

const Index = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Start somewhere familiar
              </p>
              <h2 className="mt-3 text-4xl font-bold">
                What kind of help do you need?
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center text-sm font-semibold text-[#e8d05b]"
            >
              View all services <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {legalAreas.map(([title, description, Icon]) => (
              <Link
                key={title as string}
                to="/find"
                className="group bg-[#111111] p-6 transition-colors hover:bg-[#171717]"
              >
                <Icon className="h-6 w-6 text-[#e8d05b]" />
                <h3 className="mt-10 text-xl font-semibold group-hover:text-[#e8d05b]">
                  {title as string}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  {description as string}
                </p>
                <ArrowRight className="mt-7 h-4 w-4 text-white/25 group-hover:text-[#e8d05b]" />
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                  A simple path forward
                </p>
                <h2 className="mt-4 text-4xl font-bold leading-tight">
                  From uncertainty to a useful conversation.
                </h2>
                <p className="mt-5 max-w-sm leading-7 text-white/50">
                  Legal help should begin with clarity, not complicated forms.
                </p>
              </div>
              <div className="grid gap-px bg-white/10 md:grid-cols-3">
                {steps.map(([number, title, description]) => (
                  <div key={number} className="bg-[#111111] p-6">
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
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Featured advocates
              </p>
              <h2 className="mt-3 text-4xl font-bold">
                People ready to listen.
              </h2>
            </div>
            <Link
              to="/find"
              className="inline-flex items-center text-sm font-semibold text-[#e8d05b]"
            >
              See all advocates <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {lawyers.slice(0, 4).map((lawyer) => (
              <Link
                key={lawyer.id}
                to="/lawyer-details"
                state={{ lawyer }}
                className="group border border-white/10 bg-[#111111] p-4 transition-colors hover:border-[#e8d05b]/45"
              >
                <img
                  src={lawyer.image}
                  alt={lawyer.name}
                  className="h-48 w-full object-cover grayscale-[10%]"
                />
                <div className="mt-5 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold group-hover:text-[#e8d05b]">
                      {lawyer.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#e8d05b]">
                      {lawyer.specialty}
                    </p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-[#e8d05b]" />
                </div>
                <p className="mt-3 text-xs text-white/40">
                  {lawyer.location} · {lawyer.experience}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#e8d05b] text-black">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/55">
                Not sure where to begin?
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight">
                Ask a question. Get oriented. Take the next step.
              </h2>
            </div>
            <Link
              to="/ai-legal-assistant"
              className="inline-flex shrink-0 items-center self-start border border-black/25 px-5 py-3 text-sm font-bold transition-colors hover:bg-black hover:text-[#e8d05b] md:self-auto"
            >
              Open AI assistant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
