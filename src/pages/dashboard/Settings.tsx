import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, Building2, Loader2, CheckCircle2, Camera, Sun, Moon, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const Settings = () => {
    const { user, profile, refreshProfile } = useAuth();
    const { t, lang, setLang } = useI18n();
    const { theme, setTheme } = useTheme();

    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [company, setCompany] = useState(profile?.company || "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const inputBase =
        "w-full bg-muted/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-all duration-200";

    const initials = (profile?.full_name || user?.email || "?")
        .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploadingAvatar(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `avatars/${user.id}.${ext}`;
            const { error: uploadErr } = await supabase.storage
                .from("project-files")
                .upload(path, file, { upsert: true });
            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage.from("project-files").getPublicUrl(path);
            const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

            const { error: updateErr } = await supabase
                .from("profiles")
                .update({ avatar_url: avatarUrl })
                .eq("id", user.id);
            if (updateErr) throw updateErr;

            await refreshProfile();
            toast.success("Profile photo updated!");
        } catch {
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setUploadingAvatar(false);
            e.target.value = "";
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { error } = await supabase.from("profiles").update({ full_name: fullName, company }).eq("id", user!.id);
            if (error) throw error;
            await refreshProfile();
            toast.success(t("dashboard.settingsPage.toastSaved"));
        } catch {
            toast.error(t("dashboard.settingsPage.errorSave"));
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) { toast.error(t("dashboard.settingsPage.passwordTooShort")); return; }
        if (newPassword !== confirmPassword) { toast.error(t("dashboard.settingsPage.passwordMismatch")); return; }
        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success(t("dashboard.settingsPage.toastPasswordSaved"));
            setNewPassword(""); setConfirmPassword("");
        } catch {
            toast.error(t("dashboard.settingsPage.errorPasswordSave"));
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.settingsPage.title")}</h1>
                <p className="text-muted-foreground mt-1">{t("dashboard.settingsPage.subtitle")}</p>
            </motion.div>

            <div className="grid gap-6 max-w-2xl">
                {/* ── Profile Card ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User size={16} className="text-primary" />
                        </div>
                        <h2 className="font-semibold text-base">{t("dashboard.settingsPage.profileSection")}</h2>
                    </div>
                    <div className="p-6">
                        {/* Avatar with upload */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center shadow-brand overflow-hidden shrink-0">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-primary-foreground">{initials}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-all"
                                    aria-label="Change photo"
                                >
                                    {uploadingAvatar ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
                                </button>
                                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                            <div>
                                <p className="font-semibold">{profile?.full_name || user?.email}</p>
                                <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="text-xs text-primary hover:underline mt-0.5 font-medium"
                                >
                                    Change photo
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t("dashboard.settingsPage.fullName")}
                                </label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputBase + " pl-10"} placeholder="Your Name" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t("dashboard.settingsPage.company")}
                                </label>
                                <div className="relative">
                                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className={inputBase + " pl-10"} placeholder="Your Company" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                                    {t("dashboard.settingsPage.email")}
                                    <span className="text-[10px] normal-case bg-muted px-2 py-0.5 rounded-full">{t("dashboard.settingsPage.emailHint")}</span>
                                </label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input type="email" value={user?.email || ""} readOnly className={inputBase + " pl-10 opacity-60 cursor-not-allowed"} />
                                </div>
                            </div>
                            <button type="submit" disabled={savingProfile}
                                className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-brand disabled:opacity-50">
                                {savingProfile ? <><Loader2 size={14} className="animate-spin" /> {t("dashboard.settingsPage.saving")}</> : <><CheckCircle2 size={14} /> {t("dashboard.settingsPage.saveProfile")}</>}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* ── Password Card ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Lock size={16} className="text-primary" />
                        </div>
                        <h2 className="font-semibold text-base">{t("dashboard.settingsPage.passwordSection")}</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSavePassword} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t("dashboard.settingsPage.newPassword")}
                                </label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className={inputBase + " pl-10 pr-16"} placeholder="••••••••" minLength={8} />
                                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-medium">
                                        {showNewPw ? t("auth.hidePassword") : t("auth.showPassword")}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {t("dashboard.settingsPage.confirmPassword")}
                                </label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputBase + " pl-10"} placeholder="••••••••" />
                                </div>
                            </div>
                            <button type="submit" disabled={savingPassword || !newPassword}
                                className="flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-all disabled:opacity-50">
                                {savingPassword ? <><Loader2 size={14} className="animate-spin" /> {t("dashboard.settingsPage.saving")}</> : t("dashboard.settingsPage.savePassword")}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* ── Preferences Card ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Sun size={16} className="text-primary" />
                        </div>
                        <h2 className="font-semibold text-base">Preferences</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        {/* Theme */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Theme</p>
                            <div className="grid grid-cols-3 gap-2">
                                {(["light", "dark", "system"] as const).map((t_) => (
                                    <button key={t_} onClick={() => setTheme(t_)}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium capitalize ${theme === t_ ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground"}`}>
                                        {t_ === "light" ? <Sun size={18} /> : t_ === "dark" ? <Moon size={18} /> : <Globe size={18} />}
                                        {t_}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Language */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Language</p>
                            <div className="grid grid-cols-2 gap-2">
                                {(["fr", "en"] as const).map((l) => (
                                    <button key={l} onClick={() => setLang(l)}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 transition-all text-sm font-semibold uppercase ${lang === l ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"}`}>
                                        {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
