import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff,
  CheckCircle2, AlertCircle, ArrowLeft,
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
    { label: "strong", color: "bg-green-500" },
  ];
  return { score, ...map[Math.max(0, score - 1)] };
}

// ─── Slide variants ───────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

type Mode = "signin" | "signup" | "forgot" | "reset-sent";

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
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const { t, lang, setLang } = useI18n();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const goTo = (next: Mode, direction = 1) => {
    setDir(direction);
    setMode(next);
  };

  const pwStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters.");
          return;
        }
        const { needsConfirmation } = await signUpWithEmail(email, password, name);
        if (needsConfirmation) {
          setConfirmEmail(true);
          toast.success(t("auth.accountCreated"));
        } else {
          toast.success(t("auth.accountCreated"));
          navigate("/dashboard");
        }
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
        toast.success(t("auth.welcomeToast"));
        navigate("/dashboard");
      } else if (mode === "forgot") {
        await resetPassword(email);
        goTo("reset-sent");
        toast.success(t("auth.resetSent"));
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-200";

  // ─── Confirm email state ───────────────────────────────────────────────────
  if (confirmEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("auth.checkEmail")}</h1>
          <p className="text-muted-foreground text-sm mb-6">{t("auth.confirmEmail")}</p>
          <button
            onClick={() => { setConfirmEmail(false); goTo("signin", -1); }}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} /> {t("auth.backToSignIn")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Branding.tn</span>
        </button>

        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition-all ${lang === l
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={`header-${mode}`}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold tracking-tight mb-1.5">
                {mode === "signup" ? t("auth.createAccount") :
                  mode === "forgot" ? t("auth.resetPassword") :
                    mode === "reset-sent" ? t("auth.checkEmail") :
                      t("auth.welcomeBack")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signup" ? t("auth.signUpSubtitle") :
                  mode === "forgot" ? t("auth.resetSubtitle") :
                    mode === "reset-sent" ? `${t("auth.checkEmailDesc")} ${email}` :
                      t("auth.signInSubtitle")}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Card */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={`form-${mode}`}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="p-7"
              >
                {/* ── Reset sent ── */}
                {mode === "reset-sent" && (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={26} className="text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t("auth.checkEmailDesc")} <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <button
                      onClick={() => goTo("signin", -1)}
                      className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft size={14} /> {t("auth.backToSignIn")}
                    </button>
                  </div>
                )}

                {/* ── Forms ── */}
                {mode !== "reset-sent" && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full name (signup only) */}
                    {mode === "signup" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("auth.fullName")}
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("auth.namePlaceholder")}
                            className={inputBase + " pl-10"}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("auth.email")}
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("auth.emailPlaceholder")}
                          className={inputBase + " pl-10"}
                          required
                        />
                      </div>
                    </div>

                    {/* Password (not on forgot) */}
                    {mode !== "forgot" && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("auth.password")}
                          </label>
                          {mode === "signin" && (
                            <button
                              type="button"
                              onClick={() => goTo("forgot")}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              {t("auth.forgotPassword")}
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("auth.passwordPlaceholder")}
                            className={inputBase + " pl-10 pr-16"}
                            required
                            minLength={mode === "signup" ? 8 : undefined}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                          >
                            {showPw ? (
                              <span className="flex items-center gap-1"><EyeOff size={13} />{t("auth.hidePassword")}</span>
                            ) : (
                              <span className="flex items-center gap-1"><Eye size={13} />{t("auth.showPassword")}</span>
                            )}
                          </button>
                        </div>

                        {/* Password strength (signup only) */}
                        {mode === "signup" && password.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : "bg-muted"
                                    }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t("auth.passwordStrength")}:{" "}
                              <span className={`font-medium ${pwStrength.score <= 1 ? "text-red-500" :
                                  pwStrength.score === 2 ? "text-orange-400" :
                                    pwStrength.score === 3 ? "text-yellow-500" : "text-green-500"
                                }`}>
                                {t(`auth.${pwStrength.label}`)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          {mode === "signup" ? t("auth.signUp") :
                            mode === "forgot" ? t("auth.sendResetLink") :
                              t("auth.signIn")}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ── Google + toggle (signin/signup only) ── */}
                {(mode === "signin" || mode === "signup") && (
                  <>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2.5 text-muted-foreground font-medium">
                          {t("auth.orContinueWith")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleGoogle}
                      className="w-full flex items-center justify-center gap-2.5 bg-background border border-border text-foreground py-3 rounded-xl text-sm font-medium hover:bg-muted active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </button>

                    <p className="text-center text-xs text-muted-foreground mt-5">
                      {mode === "signup" ? t("auth.alreadyHaveAccount") : t("auth.dontHaveAccount")}{" "}
                      <button
                        type="button"
                        onClick={() => goTo(mode === "signup" ? "signin" : "signup", mode === "signup" ? -1 : 1)}
                        className="text-primary font-semibold hover:underline"
                      >
                        {mode === "signup" ? t("auth.signIn") : t("auth.signUp")}
                      </button>
                    </p>
                  </>
                )}

                {/* Back link on forgot */}
                {mode === "forgot" && (
                  <button
                    type="button"
                    onClick={() => goTo("signin", -1)}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto w-fit transition-colors"
                  >
                    <ArrowLeft size={13} /> {t("auth.backToSignIn")}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
