import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
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
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-primary">Get started</p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Create your LegalSangam account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose how you’ll use the platform and get matched to the right
              tools.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="mb-2 block font-medium">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="mb-2 block font-medium">I am joining as</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: "client" | "lawyer") => setRole(value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client">Client</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lawyer" id="lawyer" />
                  <Label htmlFor="lawyer">Lawyer</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="email" className="block mb-1 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block mb-1 font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block mb-1 font-medium"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="h-11 w-full" disabled={loading}>
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
