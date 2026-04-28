import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff,
  CheckCircle2, ArrowLeft, Sparkles, Shield, Zap, Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "weak", color: "bg-red-500" },
    { label: "fair", color: "bg-orange-400" },
    { label: "good", color: "bg-yellow-400" },
    { label: "strong", color: "bg-[#1B70FF]" },
  ];
  return { score, ...map[Math.max(0, score - 1)] };
}

// ─── Animation variants ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

type Mode = "signin" | "signup" | "forgot" | "reset-sent";

// ─── Left panel social proof ──────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Shield, text: "SSL-encrypted, GDPR-ready platform" },
  { icon: Zap, text: "7-day average project turnaround" },
  { icon: Star, text: "98% client satisfaction across 120+ brands" },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as Mode) || "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [dir, setDir] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const navigate = useNavigate();
  const { user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const { t, lang, setLang } = useI18n();

  useEffect(() => { 
    if (user && profile) {
      if (profile.role === "admin") navigate("/dashboard/admin");
      else if (profile.role === "creative") navigate("/dashboard/creative");
      else navigate("/dashboard");
    }
  }, [user, profile, navigate]);

  const goTo = (next: Mode, direction = 1) => { setDir(direction); setMode(next); };

  const pwStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) { toast.error(t("auth.errorWeakPassword")); setLoading(false); return; }
        const { needsConfirmation } = await signUpWithEmail(email, password, name);
        if (needsConfirmation) { setConfirmEmail(true); toast.success(t("auth.toastAccountCreated")); }
        else { toast.success(t("auth.toastAccountCreated")); }
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
        toast.success(t("auth.toastWelcome"));
      } else if (mode === "forgot") {
        if (!email) { toast.error(t("auth.errorEnterEmail")); setLoading(false); return; }
        await resetPassword(email);
        goTo("reset-sent");
        toast.success(t("auth.toastResetSent"));
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await signInWithGoogle(); }
    catch (err: any) { toast.error(err.message); setLoading(false); }
  };

  // Input style — dark glass
  const inputBase =
    "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-200";

  // ─── Confirm-email screen ─────────────────────────────────────────────────
  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="blob-blue absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-40 pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md text-center glass-card p-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{t("auth.checkEmail")}</h1>
          <p className="text-muted-foreground text-sm mb-8">{t("auth.confirmEmail")}</p>
          <button onClick={() => { setConfirmEmail(false); goTo("signin", -1); }}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5 mx-auto">
            <ArrowLeft size={14} /> {t("auth.backToSignIn")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left panel (hidden on mobile) ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative flex-col justify-between p-12 border-r border-border bg-card shrink-0">
        {/* Background orbs */}
        <div className="blob-blue absolute top-20 left-10 w-72 h-72 opacity-30 pointer-events-none" />
        <div className="blob-purple absolute bottom-20 right-0 w-64 h-64 opacity-25 pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 z-10 relative">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-brand">
            <span className="font-bold text-sm text-primary-foreground">B</span>
          </div>
          <span className="text-base font-semibold text-foreground tracking-tight">
            branding<span className="text-primary">.tn</span>
          </span>
        </Link>

        {/* Main copy */}
        <div className="z-10 relative">
          <div className="badge-pill border-border mb-6">
            <Sparkles size={12} className="text-primary" /> Premium Branding Agency
          </div>
          <h2 className="text-4xl font-semibold text-foreground leading-[1.1] mb-5">
            Your brand,<br />
            <span className="headline-gradient">beautifully managed.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-9">
            Access your project dashboard, track deliverables, download files, and communicate with your design team — all in one place.
          </p>

          {/* Trust points */}
          <div className="space-y-4">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="z-10 relative glass-card p-5 border border-border">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-primary fill-primary" />)}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            "Branding.tn elevated our entire visual identity. Fast, precise, and genuinely creative."
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">S</div>
            <div>
              <p className="text-foreground text-xs font-semibold">Sarra Mansour</p>
              <p className="text-muted-foreground text-xs">CEO, Artisan Tunisia</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative bg-grid-lines">
        {/* Background orbs */}
        <div className="blob-blue absolute top-0 right-1/4 w-96 h-96 opacity-20 pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 relative z-10">
          {/* Logo (mobile only) */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-xs text-primary-foreground">B</span>
            </div>
            <span className="text-sm font-semibold text-foreground">branding<span className="text-primary">.tn</span></span>
          </Link>
          <div className="hidden lg:block" />

          {/* Lang toggle */}
          <div className="flex items-center gap-1 bg-muted border border-border rounded-lg p-1">
            {(["fr", "en"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition-all ${lang === l
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-10 relative z-10">
          <div className="w-full max-w-[400px]">
            {/* ── Header ── */}
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`hdr-${mode}`} custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mb-8">
                <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
                  {mode === "signup" ? t("auth.createAccount") :
                    mode === "forgot" ? t("auth.resetPassword") :
                      mode === "reset-sent" ? t("auth.checkEmail") :
                        t("auth.welcomeBack")}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {mode === "signup" ? t("auth.signUpSubtitle") :
                    mode === "forgot" ? t("auth.resetSubtitle") :
                      mode === "reset-sent" ? `${t("auth.checkEmailDesc")} ${email}` :
                        t("auth.signInSubtitle")}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ── Card ── */}
            <div className="glass-card p-7">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={`form-${mode}`} custom={dir} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}>

                  {/* Reset sent */}
                  {mode === "reset-sent" && (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={26} className="text-green-500" />
                      </div>
                      <p className="text-muted-foreground text-sm mb-6">
                        {t("auth.checkEmailDesc")} <span className="font-medium text-foreground">{email}</span>
                      </p>
                      <button onClick={() => goTo("signin", -1)}
                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5 mx-auto">
                        <ArrowLeft size={14} /> {t("auth.backToSignIn")}
                      </button>
                    </div>
                  )}

                  {/* Forms */}
                  {mode !== "reset-sent" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Full name */}
                      {mode === "signup" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auth.fullName")}</label>
                          <div className="relative">
                            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                              placeholder={t("auth.namePlaceholder")} className={inputBase + " pl-10"} required />
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auth.email")}</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder={t("auth.emailPlaceholder")} className={inputBase + " pl-10"} required />
                        </div>
                      </div>

                      {/* Password */}
                      {mode !== "forgot" && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auth.password")}</label>
                            {mode === "signin" && (
                              <button type="button" onClick={() => goTo("forgot")}
                                className="text-xs text-primary hover:underline font-medium">
                                {t("auth.forgotPassword")}
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type={showPw ? "text" : "password"}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder={t("auth.passwordPlaceholder")}
                              className={inputBase + " pl-10 pr-16"}
                              required
                              minLength={mode === "signup" ? 8 : undefined}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
                              {showPw
                                ? <span className="flex items-center gap-1"><EyeOff size={13} />{t("auth.hidePassword")}</span>
                                : <span className="flex items-center gap-1"><Eye size={13} />{t("auth.showPassword")}</span>}
                            </button>
                          </div>

                          {/* Password strength */}
                          {mode === "signup" && password.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map(i => (
                                  <div key={i}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : "bg-muted"}`} />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {t("auth.passwordStrength")}:{" "}
                                <span className={`font-medium ${pwStrength.score <= 1 ? "text-red-500" :
                                  pwStrength.score === 2 ? "text-orange-500" :
                                    pwStrength.score === 3 ? "text-yellow-500" : "text-green-500"}`}>
                                  {t(`auth.${pwStrength.label}`)}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-blue w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : (
                          <>
                            {mode === "signup" ? t("auth.signUp") :
                              mode === "forgot" ? t("auth.sendResetLink") :
                                t("auth.signIn")}
                            <ArrowRight size={15} />
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}

                  {/* Google + toggle */}
                  {(mode === "signin" || mode === "signup") && (
                    <>
                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="px-3 text-muted-foreground bg-card font-medium">
                            {t("auth.orContinueWith")}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        type="button"
                        disabled={loading}
                        onClick={handleGoogle}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-outline-white text-foreground hover:text-foreground w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </motion.button>

                      <p className="text-center text-xs text-muted-foreground mt-5">
                        {mode === "signup" ? t("auth.alreadyHaveAccount") : t("auth.dontHaveAccount")}{" "}
                        <button type="button"
                          onClick={() => goTo(mode === "signup" ? "signin" : "signup", mode === "signup" ? -1 : 1)}
                          className="text-primary font-semibold hover:underline">
                          {mode === "signup" ? t("auth.signIn") : t("auth.signUp")}
                        </button>
                      </p>
                    </>
                  )}

                  {/* Back on forgot */}
                  {mode === "forgot" && (
                    <button type="button" onClick={() => goTo("signin", -1)}
                      className="mt-4 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto w-fit transition-colors">
                      <ArrowLeft size={13} /> {t("auth.backToSignIn")}
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground mt-5">
              By signing in you agree to our{" "}
              <a href="#" className="text-foreground hover:underline transition-colors">Terms</a>
              {" & "}
              <a href="#" className="text-foreground hover:underline transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
