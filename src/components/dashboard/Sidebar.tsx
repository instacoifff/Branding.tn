import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FolderKanban, label: "Projects", href: "/dashboard/projects" },
    { icon: FileText, label: "Files", href: "/dashboard/files" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const Sidebar = () => {
    const { pathname } = useLocation();
    const { signOut } = useAuth();

    return (
        <aside className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-30 flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">B</span>
                </div>
                <span className="font-bold text-lg">Branding.tn</span>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 mt-4">
                {sidebarItems.map((item) => {
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

            <div className="p-4 border-t border-border">
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
