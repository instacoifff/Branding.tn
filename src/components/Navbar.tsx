import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang } = useI18n();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "navbar-glass py-0" : "bg-transparent py-1"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <span className="font-black text-[14px] text-white tracking-tight">B</span>
            </div>
          </div>
          <span className="text-[15px] font-semibold text-foreground tracking-tight group-hover:text-foreground/80 transition-colors">
            branding<span className="text-primary">.tn</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Services", to: "/builder" },
            { label: "Portfolio", to: "/builder" },
            { label: "Pricing", to: "/builder" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="relative px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted/50"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop right ── */}
        <div className="hidden md:flex items-center gap-2">
          {/* Lang toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg border border-border p-0.5 mr-1">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider transition-all ${
                  lang === l
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {user ? (
            <>
              <button
                onClick={() => signOut()}
                className="text-[13px] px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium"
              >
                Sign Out
              </button>
              <Link to="/dashboard">
                <button className="btn-blue text-[13px] px-5 py-2 rounded-xl flex items-center gap-1.5">
                  <span>Dashboard</span> <ArrowRight size={13} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth">
                <button className="text-[13px] px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all font-medium">
                  Sign In
                </button>
              </Link>
              <Link to="/builder">
                <button className="btn-blue text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-1.5">
                  <span>Start Project</span> <ArrowRight size={13} />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="navbar-glass border-t border-border px-6 py-6 space-y-1">
              {["Services", "Portfolio", "Pricing"].map((label) => (
                <Link
                  key={label}
                  to="/builder"
                  onClick={() => setIsOpen(false)}
                  className="block text-[14px] text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-all font-medium"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-3 space-y-2">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <button className="w-full text-left text-[14px] text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-all font-medium">
                    Sign In
                  </button>
                </Link>
                <Link to="/builder" onClick={() => setIsOpen(false)}>
                  <button className="btn-blue w-full py-3 rounded-xl text-sm font-semibold">
                    Start Your Project
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-2 pt-3">
                {(["fr", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase ${
                      lang === l
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all ml-auto"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
