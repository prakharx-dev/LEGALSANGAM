import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const primaryLinks = [
  ["Services", "/services"],
  ["Find advocates", "/find"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, username, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPath =
    role === "lawyer" ? "/lawyer-dashboard" : "/client-dashboard";
  const displayName = username?.split("@")[0] || "Account";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b0b0b]/95 text-white backdrop-blur supports-[backdrop-filter]:bg-[#0b0b0b]/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.75rem] items-center justify-between gap-6 py-3">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-3"
            aria-label="LegalSangam home"
          >
            <span className="flex h-11 w-11 items-center justify-center">
              <img
                src="/balance.png"
                alt=""
                className="h-10 w-10 object-contain"
              />
            </span>
            <span className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
              LegalSangam
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {primaryLinks.map(([label, path]) => (
              <Link
                key={path}
                to={path}
                className={`relative px-3 py-2 text-sm transition-colors ${isActive(path) ? "text-[#e8d05b]" : "text-white/55 hover:text-white"}`}
                aria-current={isActive(path) ? "page" : undefined}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-[#e8d05b]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  to={dashboardPath}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isActive(dashboardPath) ? "text-[#e8d05b]" : "text-white/55 hover:text-white"}`}
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-28 truncate">{displayName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white/45 hover:bg-white/10 hover:text-white"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm text-white/55 transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#e8d05b] hover:text-[#e8d05b]"
                >
                  Sign up
                </Link>
              </>
            )}
            <Button
              onClick={() => navigate(isLoggedIn ? "/find" : "/services")}
              className="bg-[#e8d05b] text-black hover:bg-[#f2df72]"
            >
              {isLoggedIn ? "Find an advocate" : "Get started"}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="h-11 w-11 text-white hover:bg-white/10 md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="space-y-1">
              {primaryLinks.map(([label, path]) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3 py-3 text-sm ${isActive(path) ? "bg-[#e8d05b]/10 text-[#e8d05b]" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                  aria-current={isActive(path) ? "page" : undefined}
                >
                  {label}
                  {isActive(path) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e8d05b]" />
                  )}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
              {isLoggedIn ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <User className="h-4 w-4 text-[#e8d05b]" />
                    {displayName}'s dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="px-3 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    Create an account
                  </Link>
                </>
              )}
              <Button
                onClick={() => {
                  closeMenu();
                  navigate(isLoggedIn ? "/find" : "/services");
                }}
                className="mt-2 w-full bg-[#e8d05b] text-black hover:bg-[#f2df72]"
              >
                {isLoggedIn ? "Find an advocate" : "Get started"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
