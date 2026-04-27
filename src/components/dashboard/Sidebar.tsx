import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut, Users, Shield, X, UsersRound, Palette, ChevronRight } from "lucide-react";
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
        admin: "bg-[#1B70FF]/15 text-[#6ba5ff] border-[#1B70FF]/25",
        creative: "bg-purple-500/15 text-purple-400 border-purple-500/25",
        client: "bg-white/5 text-white/40 border-white/10",
    }[profile?.role || "client"];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#0a0a0a]">
            {/* Logo */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-white/[0.06]">
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-lg bg-[#1B70FF] flex items-center justify-center shadow-[0_0_14px_rgba(27,112,255,0.45)]">
                        <span className="text-xs font-bold text-white">B</span>
                    </div>
                    <span className="text-sm font-semibold text-white tracking-tight">
                        branding<span className="text-[#1B70FF]">.tn</span>
                    </span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors md:hidden">
                        <X size={17} />
                    </button>
                )}
            </div>

            {/* Profile card */}
            <div className="px-4 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-[#1B70FF]/20 border border-[#1B70FF]/30 flex items-center justify-center overflow-hidden shrink-0">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-[#6ba5ff]">{initials}</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{profile?.full_name || user?.email}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${roleBadgeColor}`}>
                            {profile?.role || "client"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">
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
                                    ? "bg-[#1B70FF]/10 text-white border border-[#1B70FF]/20"
                                    : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                            )}
                        >
                            <Icon size={16} className={active ? "text-[#1B70FF]" : "group-hover:text-white/70"} />
                            <span className="flex-1">{item.label}</span>
                            {active && <div className="w-1 h-1 rounded-full bg-[#1B70FF]" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-white/[0.06] space-y-2">
                {/* Lang toggle */}
                <div className="flex gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
                    {(["fr", "en"] as const).map(l => (
                        <button key={l} onClick={() => setLang(l)}
                            className={cn(
                                "flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all",
                                lang === l ? "bg-white/10 text-white" : "text-white/25 hover:text-white/60"
                            )}>
                            {l}
                        </button>
                    ))}
                </div>

                <button onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full">
                    <LogOut size={15} />
                    {t("dashboard.signOut")}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="w-64 h-screen fixed left-0 top-0 z-30 hidden md:block border-r border-white/[0.06]">
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
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="absolute left-0 top-0 bottom-0 w-72 border-r border-white/[0.06] shadow-2xl"
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
