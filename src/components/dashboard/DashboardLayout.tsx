import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {
    const { user, profile } = useAuth();

    return (
        <div className="min-h-screen bg-muted/30">
            <Sidebar />
            <main className="pl-64 min-h-screen">
                <div className="container mx-auto p-8 max-w-7xl">
                    {/* Top Bar / Welcome could go here if separate from page content */}
                    <div className="flex justify-between items-center mb-8">
                        {/* Breadcrumbs or Page Title could be dynamically injected here */}
                        <div />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                                <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'User'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-semibold">{profile?.full_name?.charAt(0) || user?.email?.charAt(0)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
