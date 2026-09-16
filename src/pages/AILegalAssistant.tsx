import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getChatbotResponse } from "@/services/chatbotService";

type ChatMessage = { role: "assistant" | "user"; content: string };

const legalAreas = [
  "Criminal Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Labor Law",
  "Consumer Protection",
  "Tax Law",
  "Immigration Law",
];
const suggestions = [
  "What should I do after receiving a legal notice?",
  "How does the divorce process begin in India?",
  "Can I review a contract before signing it?",
];
const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hello. I can help you understand your situation, organize your questions, and identify a useful next step. What happened?",
};

const AILegalAssistant = () => {
  const [query, setQuery] = useState("");
  const [legalArea, setLegalArea] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isTyping, setIsTyping] = useState(false);
  const [briefSent, setBriefSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (message = query) => {
    if (!message.trim() || isTyping) return;
    const userMessage: ChatMessage = { role: "user", content: message.trim() };
    setMessages((previous) => [...previous, userMessage]);
    setQuery("");
    setIsTyping(true);
    try {
      const prompt = legalArea
        ? `[${legalArea}] ${userMessage.content}`
        : userMessage.content;
      const response = await getChatbotResponse(prompt);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: response },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "I could not reach the assistant right now. Please try again, or speak with a qualified advocate.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    setQuery("");
    setLegalArea("");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main>
        <section className="border-b border-white/10 bg-[#111111]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e8d05b]">
                  <Bot className="h-4 w-4" />
                  Ask LegalSangam
                </div>
                <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl">
                  A calmer first conversation about your legal problem.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">
                  Explain what happened in plain language. Get preliminary
                  guidance, useful questions to ask, and a clearer next step.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/45">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Available 24/7 for preliminary guidance
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:py-12">
          <div className="border border-white/10 bg-[#111111]">
            <div className="flex flex-col justify-between gap-5 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center bg-[#e8d05b] text-black">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#e8d05b]">
                    Private conversation
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Legal guidance chat
                  </h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="self-start text-white/45 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New conversation
              </Button>
            </div>
            <div className="flex h-[32rem] flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${message.role === "user" ? "bg-[#e8d05b] text-black" : "border border-white/10 bg-[#181818] text-white/75"} px-4 py-3 text-sm leading-7`}
                    >
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-45">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex">
                    <div className="border border-white/10 bg-[#181818] px-4 py-4">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#e8d05b]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#e8d05b] [animation-delay:100ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#e8d05b] [animation-delay:200ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-white/10 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xs text-white/40">
                    Focus this chat:
                  </span>
                  <Select value={legalArea} onValueChange={setLegalArea}>
                    <SelectTrigger className="h-8 w-48 border-white/15 bg-white/5 text-xs text-white">
                      <SelectValue placeholder="Any legal area" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void handleSendMessage();
                    }}
                    placeholder="Describe what happened..."
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => void handleSendMessage()}
                    disabled={!query.trim() || isTyping}
                    className="bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="border border-[#e8d05b]/30 bg-[#e8d05b]/10 p-6">
              <div className="flex items-center gap-3 text-[#e8d05b]">
                <Sparkles className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Try asking
                </p>
              </div>
              <div className="mt-5 space-y-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => void handleSendMessage(suggestion)}
                    className="flex w-full items-start gap-3 border border-white/10 bg-black/10 p-3 text-left text-sm leading-6 text-white/65 transition-colors hover:border-[#e8d05b]/50 hover:text-white"
                  >
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#e8d05b]" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>
            <section className="border border-white/10 bg-[#111111] p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#e8d05b]" />
                <h2 className="text-lg font-semibold">
                  What this assistant can do
                </h2>
              </div>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-white/50">
                <li className="flex gap-3">
                  <CheckIcon />
                  Explain common legal processes
                </li>
                <li className="flex gap-3">
                  <CheckIcon />
                  Help organize questions for an advocate
                </li>
                <li className="flex gap-3">
                  <CheckIcon />
                  Suggest useful documents and next steps
                </li>
              </ul>
            </section>
            <div className="border border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Need a professional?
              </p>
              <p className="mt-3 text-lg font-semibold">
                Turn your question into a consultation.
              </p>
              <Link
                to="/find"
                className="mt-5 inline-flex items-center text-sm font-semibold text-[#e8d05b]"
              >
                Find an advocate <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </aside>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <div className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8d05b]">
                Prepare for a human conversation
              </p>
              <h2 className="mt-4 text-3xl font-bold">
                Build a consultation brief.
              </h2>
              <p className="mt-4 leading-7 text-white/50">
                Share the basics and keep your important details together before
                you speak with an advocate.
              </p>
            </div>
            <div className="border border-white/10 bg-[#111111] p-6 sm:p-8">
              {briefSent ? (
                <div className="flex items-center gap-3 text-[#e8d05b]">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm">
                    Your consultation brief is ready to review with an advocate.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setBriefSent(true);
                  }}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      placeholder="Full name"
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    />
                    <Input
                      type="email"
                      placeholder="Email address"
                      required
                      className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                    />
                  </div>
                  <Textarea
                    placeholder="Briefly describe your situation..."
                    rows={4}
                    required
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/25"
                  />
                  <Button
                    type="submit"
                    className="bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Save consultation brief
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-yellow-500/20 bg-yellow-500/10">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 py-6 text-sm leading-6 text-yellow-100/70 sm:px-6 lg:px-8">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#e8d05b]" />
            <p>
              <strong className="text-[#e8d05b]">Important:</strong> This
              assistant provides general information and preliminary guidance,
              not legal advice. Consult a qualified advocate for decisions about
              your specific situation.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

const CheckIcon = () => (
  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e8d05b] text-[10px] text-black">
    ✓
  </span>
);

export default AILegalAssistant;
