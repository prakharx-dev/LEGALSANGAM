import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

const contactChannels = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@legalsangam.com",
    note: "Replies within 24 hours",
  },
  {
    icon: Phone,
    label: "Call support",
    value: "+91 98765 43210",
    note: "Mon-Fri, 9AM-6PM IST",
  },
  {
    icon: MapPin,
    label: "Visit our office",
    value: "Connaught Place, New Delhi",
    note: "By appointment only",
  },
];

const faqs = [
  [
    "How do I find a lawyer?",
    "Search by legal area, location, fees, and ratings on our Find Lawyers page.",
  ],
  [
    "Are lawyers verified?",
    "Advocate profiles are reviewed before they are listed, with credentials and client feedback shown where available.",
  ],
  [
    "What does a consultation cost?",
    "Fees vary by advocate and service. You can compare pricing before booking a consultation.",
  ],
  [
    "Can I use LegalSangam in my language?",
    "Yes. You can begin in English, Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, and more.",
  ],
];

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  category: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof typeof emptyForm, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setFormData(emptyForm);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <div>
                <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
                  <MessageCircle className="h-4 w-4" />
                  Contact LegalSangam
                </div>
                <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl">
                  Start with a question. Leave with a next step.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-white/55">
                  Whether you need help finding an advocate, using the platform,
                  or understanding what comes next, our team is here to make the
                  process easier.
                </p>
              </div>
              <div className="border-l border-[#e8d05b]/40 pl-6 lg:mb-2">
                <p className="text-sm font-semibold text-[#e8d05b]">
                  A human response, not a ticket number.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  Tell us what is going on in your own words. We will route your
                  question to the right place.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">
            {contactChannels.map((channel) => (
              <div key={channel.label} className="bg-[#111111] p-5 sm:p-6">
                <channel.icon className="h-5 w-5 text-[#e8d05b]" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  {channel.label}
                </p>
                <p className="mt-2 break-words text-sm font-medium text-white/85">
                  {channel.value}
                </p>
                <p className="mt-2 text-xs text-white/40">{channel.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-24">
          <div className="border border-white/10 bg-[#111111] p-5 sm:p-8">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                  Send a message
                </p>
                <h2 className="mt-3 text-3xl font-semibold">
                  How can we help?
                </h2>
              </div>
              <Clock3 className="h-5 w-5 text-white/25" />
            </div>

            {isSubmitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-[#e8d05b]" />
                <h3 className="mt-6 text-2xl font-semibold">
                  Message received.
                </h3>
                <p className="mt-3 max-w-sm leading-7 text-white/50">
                  Thanks for reaching out. Our team will review your message and
                  get back to you within 24 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-8 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(event) =>
                        handleInputChange("name", event.target.value)
                      }
                      placeholder="Your full name"
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/70">
                      Email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        handleInputChange("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/70">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(event) =>
                        handleInputChange("subject", event.target.value)
                      }
                      placeholder="What can we help with?"
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white/70">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="border-white/15 bg-white/5 text-white">
                        <SelectValue placeholder="Choose one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General inquiry</SelectItem>
                        <SelectItem value="support">
                          Technical support
                        </SelectItem>
                        <SelectItem value="legal">Legal question</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white/70">
                    Your message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(event) =>
                      handleInputChange("message", event.target.value)
                    }
                    placeholder="Tell us a little about what you need..."
                    rows={7}
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send message <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="border border-white/10 bg-[#111111] p-5 sm:p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                    Find us
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Our New Delhi office
                  </h2>
                </div>
                <MapPin className="h-5 w-5 text-[#e8d05b]" />
              </div>
              <div className="h-[420px] overflow-hidden border border-white/10 grayscale">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.984!2d77.209021315!3d28.631475682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0287b0a3f5f9%3A0x4c7e7e7e7e7e7e7e!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1690000000000"
                  title="LegalSangam office location"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="mt-4 text-sm text-white/45">
                123 Legal Street, Connaught Place, New Delhi - 110001
              </p>
            </div>

            <div className="border border-[#e8d05b]/30 bg-[#e8d05b]/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Need a lawyer right now?
              </p>
              <p className="mt-3 leading-7 text-white/55">
                Our support team can help you navigate the platform, but legal
                advice comes from an advocate.
              </p>
              <Link
                to="/find"
                className="mt-5 inline-flex items-center text-sm font-semibold text-[#e8d05b] hover:text-[#f2df72]"
              >
                Browse advocates <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="border-t border-white/10 pt-10">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Quick answers
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Frequently asked
                </h2>
              </div>
            </div>
            <div className="grid gap-x-8 divide-y divide-white/10 md:grid-cols-2 md:divide-y-0">
              {faqs.map(([question, answer]) => (
                <details
                  key={question}
                  className="group border-b border-white/10 py-5"
                >
                  <summary className="cursor-pointer list-none pr-6 text-sm font-medium text-white/80 group-open:text-[#e8d05b]">
                    {question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
