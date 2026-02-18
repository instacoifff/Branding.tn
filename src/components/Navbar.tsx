import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="font-bold text-sm text-primary-foreground">B</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            branding<span className="text-gradient">.tn</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {!isDashboard && (
            <>
              <Link to="/builder" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                to="/builder"
                className="text-sm bg-gradient-brand text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-brand"
              >
                Start a Project
              </Link>
            </>
          )}
          {isDashboard && (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Overview
              </Link>
              <Link to="/dashboard/files" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Files
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Logout
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border px-6 py-4 space-y-3"
        >
          <Link to="/builder" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
            Services
          </Link>
          <Link to="/auth" onClick={() => setIsOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
            Sign In
          </Link>
          <Link
            to="/builder"
            onClick={() => setIsOpen(false)}
            className="block text-sm bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-center"
          >
            Start a Project
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
