import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut, Users, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const Sidebar = () => {
    const { pathname } = useLocation();
    const { signOut, profile } = useAuth();
    const { t, lang, setLang } = useI18n();

    const clientItems = [
        { icon: LayoutDashboard, label: t("dashboard.overview"), href: "/dashboard" },
        { icon: FolderKanban, label: t("dashboard.projects"), href: "/dashboard/projects" },
        { icon: FileText, label: t("dashboard.files"), href: "/dashboard/files" },
        { icon: Settings, label: t("dashboard.settings"), href: "/dashboard/settings" },
    ];

    const adminItems = [
        { icon: LayoutDashboard, label: t("dashboard.adminOverview"), href: "/dashboard/admin" },
        { icon: FolderKanban, label: t("dashboard.allProjects"), href: "/dashboard/admin/projects" },
        { icon: Users, label: t("dashboard.users"), href: "/dashboard/admin/users" },
        { icon: Shield, label: t("dashboard.filesVault"), href: "/dashboard/admin/files" },
    ];

    const items = profile?.role === 'admin' ? adminItems : clientItems;

    return (
        <aside className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30 flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">B</span>
                </div>
                <span className="font-bold text-lg">Branding.tn</span>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 mt-4">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
                {/* Language toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-1">
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
        </aside>
    );
};

export default Sidebar;
