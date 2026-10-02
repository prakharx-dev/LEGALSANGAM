import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"client" | "lawyer">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const getAuthError = (authError: unknown) => {
    if (
      authError instanceof Error &&
      authError.message.includes("Cloud Firestore")
    ) {
      return authError.message;
    }

    const code = (authError as { code?: string })?.code;
    const messages: Record<string, string> = {
      "auth/email-already-in-use":
        "An account with this email already exists. Try signing in.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/weak-password":
        "Choose a stronger password with at least 6 characters.",
      "auth/popup-closed-by-user": "The Google sign-up window was closed.",
      "auth/popup-blocked":
        "Your browser blocked the sign-up window. Allow pop-ups and try again.",
      "auth/unauthorized-domain":
        "This site is not authorized for Google sign-in. Add its domain in Firebase Authentication settings.",
      "auth/operation-not-allowed":
        "Google sign-in is not enabled for this Firebase project.",
      "auth/network-request-failed":
        "The sign-up request failed. Check your internet connection and try again.",
    };
    return (
      messages[code || ""] ||
      "We couldn't create your account. Please try again."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError("Enter your full name.");
      setLoading(false);
      return;
    }
    if (!email) {
      setError("Enter your email address.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Create a password.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (!role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    try {
      await signUpWithEmail(name, email, password, role);
      // On success, auto-sign-in happens via Firebase, navigate to role-specific dashboard
      if (role === "client") {
        navigate("/client-dashboard", { replace: true });
      } else if (role === "lawyer") {
        navigate("/lawyer-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: unknown) {
      setError(getAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.14),transparent_36%),hsl(var(--background))] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 lg:grid-cols-[1.1fr_.9fr]">
        <div className="p-6 sm:p-10">
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-primary">Get started</p>
            <h2 className="text-3xl font-semibold">Join LegalSangam</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account to connect with the right legal workspace.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-x-4 gap-y-4 sm:grid-cols-2"
          >
            <div className="min-w-0">
              <Label htmlFor="name" className="mb-1.5 block font-medium">
                Full name
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="min-w-0">
              <Label htmlFor="email" className="mb-1.5 block font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <p id="role-label" className="mb-2 text-sm font-medium">
                Choose your account type
              </p>
              <RadioGroup
                aria-labelledby="role-label"
                value={role}
                onValueChange={(value: "client" | "lawyer") => setRole(value)}
                className="grid gap-2 sm:grid-cols-2"
              >
                <div
                  className={`relative rounded-xl border p-3 transition-colors ${role === "client" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="client"
                    id="client"
                    className="absolute right-3 top-3"
                    aria-describedby="client-description"
                  />
                  <Label
                    htmlFor="client"
                    className="flex cursor-pointer items-start gap-3 pr-8"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        Client
                      </span>
                      <span
                        id="client-description"
                        className="mt-0.5 block text-xs leading-5 text-muted-foreground"
                      >
                        Find an advocate and manage consultations.
                      </span>
                    </span>
                  </Label>
                </div>
                <div
                  className={`relative rounded-xl border p-3 transition-colors ${role === "lawyer" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:bg-muted/40"}`}
                >
                  <RadioGroupItem
                    value="lawyer"
                    id="lawyer"
                    className="absolute right-3 top-3"
                    aria-describedby="lawyer-description"
                  />
                  <Label
                    htmlFor="lawyer"
                    className="flex cursor-pointer items-start gap-3 pr-8"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        Lawyer
                      </span>
                      <span
                        id="lawyer-description"
                        className="mt-0.5 block text-xs leading-5 text-muted-foreground"
                      >
                        Build your profile and meet new clients.
                      </span>
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="min-w-0">
              <Label htmlFor="password" className="mb-1.5 block font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Use at least 6 characters.
              </p>
            </div>
            <div className="min-w-0">
              <Label
                htmlFor="confirmPassword"
                className="mb-1.5 block font-medium"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                  aria-pressed={showConfirmPassword}
                  title={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="h-11 w-full sm:col-span-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                  account...
                </>
              ) : (
                <>
                  Create account <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Google Sign Up Option */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={async () => {
                try {
                  setLoading(true);
                  await signInWithGoogle(role);
                  navigate(
                    role === "lawyer"
                      ? "/lawyer-dashboard"
                      : "/client-dashboard",
                    { replace: true },
                  );
                } catch (googleError) {
                  setError(getAuthError(googleError));
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>
          </div>

          <div className="mt-7 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <div className="mb-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-[.18em]">
              <ShieldCheck className="h-5 w-5" /> LegalSangam
            </div>
            <p className="max-w-xs text-4xl font-semibold leading-tight">
              A clearer path through legal work.
            </p>
            <div className="mt-8 space-y-4 text-sm opacity-80">
              <p className="flex gap-3">
                <Check className="h-5 w-5 shrink-0" /> Find the right advocate
                faster
              </p>
              <p className="flex gap-3">
                <Check className="h-5 w-5 shrink-0" /> Keep consultations
                organized
              </p>
              <p className="flex gap-3">
                <Check className="h-5 w-5 shrink-0" /> Make informed next steps
              </p>
            </div>
          </div>
          <p className="text-sm opacity-70">
            Secure access to your legal workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
