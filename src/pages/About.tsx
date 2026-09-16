import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Globe2,
  HeartHandshake,
  Landmark,
  LockKeyhole,
  MessageCircle,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const principles = [
  {
    icon: BadgeCheck,
    number: "01",
    title: "Clarity before commitment",
    description:
      "See experience, practice areas, location, ratings, and fees before you choose who to speak with.",
  },
  {
    icon: HeartHandshake,
    number: "02",
    title: "People, not paperwork",
    description:
      "A calmer first conversation helps you explain what happened and decide what should happen next.",
  },
  {
    icon: LockKeyhole,
    number: "03",
    title: "Trust in every detail",
    description:
      "Your conversations and documents deserve careful handling, transparent expectations, and respect.",
  },
];

const steps = [
  [
    "01",
    "Tell us what you need",
    "Start with a plain-language question or browse a legal area.",
  ],
  [
    "02",
    "Meet the right advocate",
    "Compare profiles and choose someone who fits your situation.",
  ],
  [
    "03",
    "Move forward with confidence",
    "Book a consultation, share context, and keep your next step clear.",
  ],
];

const languages = [
  "Hindi",
  "English",
  "Bengali",
  "Telugu",
  "Marathi",
  "Tamil",
  "Urdu",
  "Gujarati",
];

const About = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-14">
            <div>
              <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
                <Scale className="h-4 w-4" />
                About LegalSangam
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
                Legal help should feel human from the first step.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
                LegalSangam makes it easier to understand your options, find a
                trusted advocate, and take action without having to decode the
                legal system alone.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/find"
                  className="inline-flex items-center bg-[#e8d05b] px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#f2df72]"
                >
                  Find an advocate
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Talk to our team
                  <MessageCircle className="ml-2 h-4 w-4 text-[#e8d05b]" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[440px] overflow-hidden border border-white/10 bg-[#171717]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(232,208,91,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(232,208,91,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85"
                alt="Law books and a legal gavel"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#0b0b0b]/35 mix-blend-multiply" />
              <div className="absolute left-6 top-6 border border-white/15 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/55">
                Trust
              </div>
              <div className="absolute right-6 top-20 border border-white/15 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/55">
                Access
              </div>
              <div className="absolute bottom-28 left-8 border border-white/15 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/55">
                Clarity
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8d05b]">
                  <span className="h-px w-6 bg-[#e8d05b]" />
                  The balance we bring
                </div>
                <p className="text-2xl font-semibold">
                  A clearer path through the legal system.
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Fair guidance, made easier to reach.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 md:grid-cols-4">
            {[
              ["5,000+", "Advocates on the network"],
              ["50,000+", "People supported"],
              ["25", "Cities represented"],
              ["8+", "Languages to begin in"],
            ].map(([value, label]) => (
              <div key={label} className="px-4 py-6 first:pl-0 md:px-6">
                <p className="text-3xl font-semibold tracking-tight text-[#e8d05b]">
                  {value}
                </p>
                <p className="mt-2 max-w-[12rem] text-xs leading-5 text-white/45">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d05b]">
                What we believe
              </p>
              <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight sm:text-5xl">
                Make the first move feel possible.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-white/50">
                Legal questions can arrive suddenly and feel intimidating. We
                are building a more understandable front door to legal care,
                with useful technology and real professional judgment working
                together.
              </p>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {principles.map((principle) => (
                <div
                  key={principle.number}
                  className="grid gap-5 py-7 sm:grid-cols-[3rem_1fr] sm:items-start"
                >
                  <div className="flex items-center gap-3 text-sm text-[#e8d05b]">
                    <principle.icon className="h-5 w-5" />
                    <span>{principle.number}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{principle.title}</h3>
                    <p className="mt-2 max-w-xl leading-7 text-white/50">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d05b]">
                  A simpler journey
                </p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                  From question to next step.
                </h2>
              </div>
              <Landmark className="h-12 w-12 text-white/15" />
            </div>
            <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
              {steps.map(([number, title, description]) => (
                <div key={number} className="bg-[#111111] p-6 sm:p-8">
                  <span className="text-sm font-semibold text-[#e8d05b]">
                    {number}
                  </span>
                  <h3 className="mt-12 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-white/50">{description}</p>
                  <ArrowRight className="mt-8 h-5 w-5 text-white/25" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-[#e8d05b]">
                <Globe2 className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                  Built for India
                </span>
              </div>
              <h2 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
                Your language should never be a barrier to being heard.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-white/50">
                LegalSangam is designed for the way India speaks, searches, and
                asks for help. Start in the language that makes your situation
                easiest to explain.
              </p>
              <div className="mt-7 flex max-w-xl flex-wrap gap-2">
                {languages.map((language) => (
                  <span
                    key={language}
                    className="border border-white/15 px-3 py-2 text-sm text-white/65"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-[#e8d05b]/30 bg-[#e8d05b]/10 p-7 sm:p-9">
              <Sparkles className="h-7 w-7 text-[#e8d05b]" />
              <p className="mt-8 text-2xl font-semibold leading-tight">
                Technology can make legal help easier to reach. People make it
                worth trusting.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm text-white/55">
                <Users className="h-4 w-4 text-[#e8d05b]" />
                Made for clients and advocates together
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#e8d05b] text-black">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8 lg:py-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/55">
                Start where you are
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
                A clearer next step is closer than you think.
              </h2>
            </div>
            <Link
              to="/find"
              className="inline-flex shrink-0 items-center self-start border border-black/25 px-5 py-3 text-sm font-bold transition-colors hover:bg-black hover:text-[#e8d05b] md:self-auto"
            >
              Explore advocates
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
