import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut, Users, Shield, X, UsersRound, Palette, ChevronRight, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SidebarProps = { open?: boolean; onClose?: () => void; };

const Sidebar = ({ open, onClose }: SidebarProps) => {
    const { pathname } = useLocation();
    const { signOut, profile, user } = useAuth();
    const { t, lang, setLang } = useI18n();

    const clientItems = [
        { icon: LayoutDashboard, label: t("dashboard.overview"), href: "/dashboard", exact: true },
        { icon: FolderKanban, label: t("dashboard.projects"), href: "/dashboard/projects" },
        { icon: FileText, label: t("dashboard.files"), href: "/dashboard/files" },
        { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/settings" },
    ];

    const adminItems = [
        { icon: LayoutDashboard, label: t("dashboard.adminOverview"), href: "/dashboard/admin", exact: true },
        { icon: FolderKanban, label: t("dashboard.allProjects"), href: "/dashboard/admin/projects" },
        { icon: MessageSquare, label: "Global Inbox", href: "/dashboard/admin/inbox" },
        { icon: Users, label: t("dashboard.users"), href: "/dashboard/admin/users" },
        { icon: UsersRound, label: "Team Members", href: "/dashboard/admin/team" },
        { icon: Shield, label: t("dashboard.filesVault"), href: "/dashboard/admin/files" },
    ];

    const creativeItems = [
        { icon: Palette, label: "My Tasks", href: "/dashboard/creative", exact: true },
        { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/settings" },
    ];

    const items =
        profile?.role === "admin" ? adminItems :
            profile?.role === "creative" ? creativeItems :
                clientItems;

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const initials = (profile?.full_name || user?.email || "?")
        .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const roleBadgeColor = {
        admin: "bg-primary/15 text-primary border-primary/25",
        creative: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
        client: "bg-foreground/5 text-muted-foreground border-border",
    }[profile?.role || "client"];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card">
            {/* Logo */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-border">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-brand">
                        <span className="text-xs font-bold text-primary-foreground">B</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground tracking-tight">
                        branding<span className="text-primary">.tn</span>
                    </span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors md:hidden">
                        <X size={17} />
                    </button>
                )}
            </div>

            {/* Profile card */}
            <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-primary">{initials}</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || user?.email}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${roleBadgeColor}`}>
                            {profile?.role || "client"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
                    {profile?.role === "admin" ? "Admin Panel" : profile?.role === "creative" ? "Workspace" : "My Account"}
                </p>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                                active
                                    ? "bg-primary/10 text-foreground border border-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon size={16} className={active ? "text-primary" : "group-hover:text-foreground/70"} />
                            <span className="flex-1">{item.label}</span>
                            {active && <div className="w-1 h-1 rounded-full bg-primary" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-border space-y-2">
                {/* Lang toggle */}
                <div className="flex gap-1 bg-muted/50 rounded-lg p-1 border border-border">
                    {(["fr", "en"] as const).map(l => (
                        <button key={l} onClick={() => setLang(l)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                                lang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}>
                            {l}
                        </button>
                    ))}
                </div>

                <button onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full">
                    <LogOut size={15} />
                    {t("dashboard.signOut")}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="w-64 h-screen fixed left-0 top-0 z-30 hidden md:block border-r border-border">
                <SidebarContent />
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 md:hidden"
                    >
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="absolute left-0 top-0 bottom-0 w-72 border-r border-border shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
