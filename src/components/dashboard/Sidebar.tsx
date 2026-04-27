import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut, Users, Shield, X, UsersRound, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type SidebarProps = {
    open?: boolean;
    onClose?: () => void;
};

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
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo + close (mobile) */}
            <div className="p-5 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand">
                        <span className="text-sm font-bold text-primary-foreground">B</span>
                    </div>
                    <span className="font-bold text-base">Branding.tn</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground md:hidden">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Profile card */}
            <div className="px-4 py-4 border-b border-border">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs font-bold text-primary-foreground">{initials}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{profile?.full_name || user?.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{profile?.role || "user"}</p>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon size={18} className={active ? "text-primary" : ""} />
                            {item.label}
                            {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: lang toggle + sign out */}
            <div className="p-3 border-t border-border space-y-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {(["fr", "en"] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={cn(
                                "flex-1 py-1 rounded-md text-xs font-semibold uppercase transition-all",
                                lang === l
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                    <LogOut size={18} />
                    {t("dashboard.signOut")}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30 hidden md:block">
                {sidebarContent}
            </aside>

            {/* Mobile drawer overlay */}
            {open && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border shadow-xl">
                        {sidebarContent}
                    </aside>
                </div>
            )}
        </>
    );
};

export default Sidebar;
