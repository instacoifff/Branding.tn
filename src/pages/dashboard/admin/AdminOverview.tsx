import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderKanban, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

const AdminOverview = () => {
    const { t } = useI18n();
    const [stats, setStats] = useState({ totalProjects: 0, activeClients: 0, totalRevenue: 0, pendingBriefs: 0 });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (projectsError) console.error(projectsError);

            const [
                { count: projectCount },
                { count: clientCount },
                { count: pendingCount },
            ] = await Promise.all([
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
                supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'onboarding'),
            ]);

            setStats({
                totalProjects: projectCount || 0,
                activeClients: clientCount || 0,
                totalRevenue: 12500,
                pendingBriefs: pendingCount || 0,
            });

            setRecentProjects(projects || []);
            setLoading(false);
        };

        fetchAdminData();
    }, []);

    if (loading) return <div className="p-8 text-muted-foreground">{t("common.loading")}</div>;

    const statCards = [
        { label: t("dashboard.totalProjects"), value: stats.totalProjects, icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: t("dashboard.totalRevenue"), value: `${stats.totalRevenue.toLocaleString()} TND`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
        { label: t("dashboard.activeClients"), value: stats.activeClients, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: t("dashboard.pendingBriefs"), value: stats.pendingBriefs, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.adminOverview")}</h1>
                <p className="text-muted-foreground mt-2">{t("dashboard.welcome")} 👋</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t("dashboard.recentProjects")}</h2>
                    <Link to="/dashboard/admin/projects" className="text-sm text-primary hover:underline">{t("dashboard.viewAll")}</Link>
                </div>
                <div className="divide-y divide-border">
                    {recentProjects.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">{t("dashboard.noRecentProjects")}</div>
                    ) : (
                        recentProjects.map((project) => (
                            <div key={project.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div>
                                    <h3 className="font-medium text-foreground">{project.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">{t("dashboard.adminProjects.client")}: {project.profiles?.full_name || '—'}</span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                    ${project.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                                            project.status === 'active' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'}`}>
                                        {t(`dashboard.status.${project.status}`) || project.status}
                                    </span>
                                    <Link to={`/dashboard/admin/projects/${project.id}`} className="text-sm font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                                        {t("dashboard.adminProjectDetail.viewProject")}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminOverview;
