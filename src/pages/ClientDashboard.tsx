import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Bell,
  Calendar,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  User,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ClientDashboard = () => {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    activeBookings,
    totalLawyersConsulted,
    pendingPayments,
    notifications,
    analytics,
    loading,
    error,
  } = useDashboardData();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (role === "lawyer") {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="border-b border-white/10 bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d05b]">
                <span className="h-px w-8 bg-[#e8d05b]" />
                Your legal desk
              </div>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
                Good to see you, {user.displayName?.split(" ")[0] || "there"}.
              </h1>
              <p className="mt-3 max-w-xl text-base text-white/55">
                Keep your legal work moving with a clear view of consultations,
                payments, and the people helping you forward.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/ai-legal-assistant")}
              >
                <Sparkles className="mr-2 h-4 w-4 text-[#e8d05b]" />
                Ask AI Assistant
              </Button>
              <Button
                className="bg-[#e8d05b] text-black hover:bg-[#f2df72]"
                onClick={() => navigate("/booking")}
              >
                Book a consultation
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mt-8 border-[#e8d05b]/30 bg-[#e8d05b]/10 text-[#f2df72]">
              <AlertDescription>
                Live data is temporarily unavailable. Your saved dashboard is
                still usable.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
          {[
            {
              label: "Active bookings",
              value: activeBookings,
              note: "Currently in progress",
              icon: Calendar,
            },
            {
              label: "Lawyers consulted",
              value: totalLawyersConsulted,
              note: "Across your legal journey",
              icon: User,
            },
            {
              label: "Pending payments",
              value: `₹${pendingPayments}`,
              note: pendingPayments > 0 ? "Needs your attention" : "All clear",
              icon: WalletCards,
            },
          ].map((metric) => (
            <div key={metric.label} className="bg-[#111111] p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <span className="text-sm text-white/55">{metric.label}</span>
                <metric.icon className="h-4 w-4 text-[#e8d05b]" />
              </div>
              <div className="mt-6 text-3xl font-semibold tracking-tight">
                {metric.value}
              </div>
              <p className="mt-1 text-xs text-white/40">{metric.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8d05b]">
                  Your activity
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Monthly bookings
                </h2>
              </div>
              <TrendingUp className="h-5 w-5 text-white/35" />
            </div>
            <ChartContainer
              config={{ count: { label: "Bookings", color: "#e8d05b" } }}
              className="mt-6 h-[250px] w-full"
            >
              <BarChart data={analytics.monthlyBookings}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#e8d05b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </section>

          <section className="relative overflow-hidden bg-[#e8d05b] p-6 text-black sm:p-7">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[18px] border-black/10" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-black/60">
                    Next step
                  </span>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="mt-12 max-w-xs text-3xl font-bold leading-tight">
                  Find the right advocate for your case.
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-6 text-black/65">
                  Compare expertise, location, fees, and availability in one
                  focused search.
                </p>
              </div>
              <button
                className="mt-10 flex items-center justify-between border-t border-black/20 pt-4 text-left text-sm font-semibold"
                onClick={() => navigate("/find")}
              >
                Browse advocates
                <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Shortcuts
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  Move things forward
                </h2>
              </div>
              <Search className="h-5 w-5 text-[#e8d05b]" />
            </div>
            <div className="mt-6 divide-y divide-white/10">
              {[
                {
                  label: "Find a lawyer",
                  detail: "Search by expertise",
                  icon: User,
                  path: "/find",
                },
                {
                  label: "Explore services",
                  detail: "Start with a legal area",
                  icon: FileText,
                  path: "/services",
                },
                {
                  label: "Edit your profile",
                  detail: "Keep your details current",
                  icon: User,
                  path: "/profile",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:text-[#e8d05b]"
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-4 w-4 text-[#e8d05b]" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {action.label}
                    </span>
                    <span className="mt-1 block text-xs text-white/40">
                      {action.detail}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/30" />
                </button>
              ))}
            </div>
          </section>

          <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                  Live feed
                </p>
                <h2 className="mt-2 text-xl font-semibold">Notifications</h2>
              </div>
              <Bell className="h-5 w-5 text-[#e8d05b]" />
            </div>
            <div className="mt-6">
              {notifications.length > 0 ? (
                <ul className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.type === "success"
                            ? "bg-emerald-400"
                            : notification.type === "warning"
                              ? "bg-amber-300"
                              : "bg-sky-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white/80">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 border border-dashed border-white/15 p-4 text-sm text-white/45">
                  <Bell className="h-4 w-4" />
                  No new notifications
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 flex flex-col justify-between gap-6 border border-white/10 bg-[#111111] p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8d05b] text-black">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                Account
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {user.displayName || "Your profile"}
              </h2>
              <p className="mt-1 text-sm text-white/45">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="border border-[#e8d05b]/30 bg-[#e8d05b]/10 text-[#e8d05b]">
              Client
            </Badge>
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/profile")}
            >
              Manage profile
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClientDashboard;
