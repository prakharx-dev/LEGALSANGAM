import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Scale,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const platformLinks = [
  ["Find Lawyers", "/find"],
  ["Legal Services", "/services"],
  ["AI Legal Assistant", "/ai-legal-assistant"],
  ["Document Review", "/document-review"],
  ["Community", "/community"],
];

const companyLinks = [
  ["About LegalSangam", "/about"],
  ["Contact Support", "/contact"],
  ["Client Dashboard", "/client-dashboard"],
  ["Lawyer Dashboard", "/lawyer-dashboard"],
];

const legalAreas = [
  "Family law",
  "Criminal law",
  "Corporate law",
  "Property law",
  "Labour law",
];

const socials = [
  [Facebook, "Facebook"],
  [Twitter, "Twitter"],
  [Linkedin, "LinkedIn"],
  [Instagram, "Instagram"],
] as const;

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0b0b0b] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 py-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[#e8d05b]">
              <Scale className="h-6 w-6" />
              <span className="text-xl font-semibold tracking-tight text-white">
                LegalSangam
              </span>
            </div>
            <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              A clearer way to find your next legal step.
            </h2>
          </div>
          <Link
            to="/find"
            className="inline-flex items-center self-start border border-[#e8d05b]/50 px-4 py-3 text-sm font-semibold text-[#e8d05b] transition-colors hover:bg-[#e8d05b] hover:text-black md:self-auto"
          >
            Find an advocate
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="max-w-xs text-sm leading-6 text-white/45">
              LegalSangam connects people with advocates who can listen,
              explain, and help them move forward with confidence.
            </p>
            <div className="mt-7 flex items-center gap-2">
              {socials.map(([Icon, label]) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-colors hover:border-[#e8d05b] hover:text-[#e8d05b]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
              Platform
            </p>
            <ul className="mt-5 space-y-3">
              {platformLinks.map(([label, path]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
              Company
            </p>
            <ul className="mt-5 space-y-3">
              {companyLinks.map(([label, path]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
              Reach us
            </p>
            <div className="mt-5 space-y-4 text-sm text-white/50">
              <a
                href="mailto:support@legalsangam.com"
                className="flex items-start gap-3 transition-colors hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#e8d05b]" />
                <span>support@legalsangam.com</span>
              </a>
              <a
                href="tel:+919876543210"
                className="flex items-start gap-3 transition-colors hover:text-white"
              >
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#e8d05b]" />
                <span>+91 98765 43210</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e8d05b]" />
                <span>
                  New Delhi, India
                  <br />
                  Serving clients across India
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 py-8 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
              Explore legal areas
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {legalAreas.map((area) => (
                <Link
                  key={area}
                  to="/find"
                  className="text-sm text-white/45 transition-colors hover:text-[#e8d05b]"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:text-right">
            <p className="text-sm leading-6 text-white/35">
              LegalSangam helps you find legal professionals. It does not
              replace advice from a qualified advocate.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-white/10 py-6 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 LegalSangam. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
