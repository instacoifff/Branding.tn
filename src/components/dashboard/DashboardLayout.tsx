import { Outlet, useLocation, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { Menu, ChevronRight, Settings, LogOut, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ── Breadcrumb helpers ── */
const CRUMB_MAP: Record<string, string> = {
    dashboard: "dashboard", projects: "projects", files: "files",
    settings: "settings", admin: "admin", users: "users",
    team: "team", creative: "creative",
};

const useBreadcrumbs = (pathname: string, t: (k: string) => string) => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.reduce<{ label: string; href: string }[]>((acc, seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const key = CRUMB_MAP[seg];
        if (key) {
            const labelMap: Record<string, string> = {
                dashboard: "Overview", projects: "Projects", files: "Files",
                settings: "Settings", admin: "Admin", users: "Users",
                team: "Team", creative: "My Tasks",
            };
            acc.push({ label: labelMap[key] || key, href });
        } else if (/^[0-9a-f-]{36}$/i.test(seg)) {
            const last = acc[acc.length - 1];
            if (last) acc.push({ label: "Detail", href });
        }
        return acc;
    }, []);
};

const DashboardLayout = () => {
    const { user, profile, signOut } = useAuth();
    const { t } = useI18n();
    const { pathname } = useLocation();
    const { theme, setTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    const breadcrumbs = useBreadcrumbs(pathname, t);

    const initials = (profile?.full_name || user?.email || "?")
        .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
                setAvatarMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col md:ml-64 min-w-0">
                {/* Top bar */}
                <header className="h-14 border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-20 flex items-center px-4 md:px-6 gap-4">
                    {/* Hamburger */}
                    <button onClick={() => setSidebarOpen(true)}
                        className="md:hidden text-muted-foreground hover:text-foreground transition-colors" aria-label="Open menu">
                        <Menu size={19} />
                    </button>

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-sm min-w-0 flex-1 overflow-hidden">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                                {idx > 0 && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
                                {idx === breadcrumbs.length - 1 ? (
                                    <span className="font-semibold text-foreground text-sm truncate">{crumb.label}</span>
                                ) : (
                                    <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm truncate">
                                        {crumb.label}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Theme toggle */}
                    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Toggle theme">
                        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    {/* Notification bell */}
                    <NotificationBell />

                    {/* Avatar dropdown */}
                    <div className="relative shrink-0" ref={avatarRef}>
                        <button onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                            className="flex items-center gap-2.5 rounded-xl hover:bg-muted p-1.5 transition-colors">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-semibold text-foreground leading-tight">{profile?.full_name || user?.email}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{profile?.role || "user"}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold text-primary">{initials}</span>
                                )}
                            </div>
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {avatarMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
                                >
                                    <Link to="/dashboard/settings" onClick={() => setAvatarMenuOpen(false)}
                                        className={cn("flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                                            pathname.startsWith("/dashboard/settings")
                                                ? "text-primary bg-primary/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                                        <Settings size={14} />
                                        {t("dashboard.settings")}
                                    </Link>
                                    <div className="border-t border-border my-1" />
                                    <button onClick={() => { setAvatarMenuOpen(false); signOut(); }}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left">
                                        <LogOut size={14} />
                                        {t("dashboard.signOut")}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 md:p-8 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
