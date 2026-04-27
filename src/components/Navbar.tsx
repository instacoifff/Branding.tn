import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { signOut, user } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "navbar-glass" : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-brand">
            <span className="font-bold text-[13px] text-primary-foreground">B</span>
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            branding<span className="text-primary">.tn</span>
          </span>
        </Link>

        {/* Desktop center nav */}
        <div className="hidden md:flex items-center gap-7">
          <Link to="/builder" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors font-medium">
            Services
          </Link>
          <div className="text-[14px] text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1 cursor-default">
            Pricing <ChevronDown size={13} />
          </div>
          <Link to="/auth" className="text-[14px] text-muted-foreground hover:text-foreground transition-colors font-medium">
            {user ? "Dashboard" : "Sign In"}
          </Link>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {/* Lang */}
          <div className="flex items-center gap-1">
            <button onClick={() => setLang("fr")} className={`text-xs px-2 py-1 rounded transition-colors ${lang === "fr" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>FR</button>
            <button onClick={() => setLang("en")} className={`text-xs px-2 py-1 rounded transition-colors ${lang === "en" ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>EN</button>
          </div>
          {/* Theme toggle */}
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {user ? (
            <>
              <button onClick={() => signOut()} className="btn-outline-white text-[13px] px-4 py-2 rounded-lg">
                Sign Out
              </button>
              <Link to="/dashboard">
                <button className="btn-blue text-[13px] px-4 py-2 rounded-lg flex items-center gap-1.5">
                  Dashboard <ArrowRight size={13} />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth">
                <button className="btn-outline-white text-[13px] px-4 py-2 rounded-lg">Sign In</button>
              </Link>
              <Link to="/builder">
                <button className="btn-blue text-[13px] px-4 py-2 rounded-lg flex items-center gap-1.5">
                  Start Free <ArrowRight size={13} />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground" aria-label="Toggle menu">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden navbar-glass border-t border-white/[0.06] px-6 py-5 space-y-4 overflow-hidden"
          >
            <Link to="/builder" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1">Services</Link>
            <Link to="/auth" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-1">Sign In</Link>
            <Link to="/builder" onClick={() => setIsOpen(false)}>
              <button className="btn-blue w-full py-2.5 rounded-xl text-sm mt-2">Start Your Project</button>
            </Link>
            <div className="flex items-center gap-3 pt-1">
              <button onClick={() => setLang("fr")} className={`text-xs px-2 py-1 rounded ${lang === "fr" ? "text-foreground font-bold" : "text-muted-foreground"}`}>FR</button>
              <button onClick={() => setLang("en")} className={`text-xs px-2 py-1 rounded ${lang === "en" ? "text-foreground font-bold" : "text-muted-foreground"}`}>EN</button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground">
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
