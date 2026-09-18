import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const {
    signInWithGoogle,
    signInWithEmail,
    sendPasswordReset,
    role,
    isLoggedIn,
    isLoading,
  } = useAuth();

  const getAuthError = (authError: unknown) => {
    const code = (authError as { code?: string })?.code;
    const messages: Record<string, string> = {
      "auth/invalid-credential": "That email or password is not correct.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/too-many-requests":
        "Too many attempts. Please wait a moment and try again.",
      "auth/popup-closed-by-user": "The Google sign-in window was closed.",
      "auth/popup-blocked":
        "Your browser blocked the sign-in window. Allow pop-ups and try again.",
      "auth/unauthorized-domain":
        "This site is not authorized for Google sign-in. Add its domain in Firebase Authentication settings.",
      "auth/operation-not-allowed":
        "Google sign-in is not enabled for this Firebase project.",
      "auth/network-request-failed":
        "The sign-in request failed. Check your internet connection and try again.",
    };
    return messages[code || ""] || "We couldn't sign you in. Please try again.";
  };

  useEffect(() => {
    if (!loginAttempted || isLoading || !isLoggedIn) {
      return;
    }

    if (role === "client") {
      navigate("/client-dashboard", { replace: true });
    } else if (role === "lawyer") {
      navigate("/lawyer-dashboard", { replace: true });
    } else {
      navigate("/client-dashboard", { replace: true });
    }

    setLoginAttempted(false);
  }, [loginAttempted, isLoading, isLoggedIn, role, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Enter your email address.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Enter your password.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmail(email, password);
      setLoginAttempted(true);
      // Navigation will be handled by useEffect based on role
    } catch (error) {
      setError(getAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      setLoginAttempted(true);
      // Navigation will be handled by useEffect based on role
    } catch (error) {
      setError(getAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setResetSent(false);
    if (!email.trim()) {
      setError("Enter your email first, then choose forgot password.");
      return;
    }

    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (resetError) {
      setError(getAuthError(resetError));
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/.14),transparent_36%),hsl(var(--background))] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 lg:grid-cols-[.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div>
            <div className="mb-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-[.18em]">
              <ShieldCheck className="h-5 w-5" /> LegalSangam
            </div>
            <p className="max-w-xs text-4xl font-semibold leading-tight">
              Trusted legal help, one conversation away.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 opacity-75">
              Connect with verified advocates, review documents, and keep every
              legal step organized.
            </p>
          </div>
          <p className="text-sm opacity-70">
            Private by design. Built for confident decisions.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-primary">
              Welcome back
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your legal workspace is waiting for you.
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="mb-2 block font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="password" className="font-medium">
                  Password
                </Label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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
            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            {resetSent && (
              <p
                role="status"
                className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              >
                Password reset email sent. Check your inbox.
              </p>
            )}
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing
                  in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
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
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Connecting...
                </>
              ) : (
                <>
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
                  Log In with Google
                </>
              )}
            </Button>
          </div>
          <div className="mt-7 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
