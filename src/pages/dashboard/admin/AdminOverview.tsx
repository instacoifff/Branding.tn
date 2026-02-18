import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderKanban, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeClients: 0,
        totalRevenue: 0, // Placeholder
        pendingBriefs: 0
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            // Fetch Projects
            const { data: projects, error: projectsError } = await supabase
                .from('projects')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (projectsError) console.error(projectsError);

            // Fetch Stats (Mocked for now mostly, but projects count is real)
            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
            // const { count: clientCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'); // Requires policy

            setStats({
                totalProjects: projectCount || 0,
                activeClients: 0, // Needs DB policy update to count all profiles
                totalRevenue: 12500, // Placeholder
                pendingBriefs: 2 // Placeholder
            });

            setRecentProjects(projects || []);
            setLoading(false);
        };

        fetchAdminData();
    }, []);

    if (loading) return <div className="p-8">Loading admin dashboard...</div>;

    const statCards = [
        { label: "Total Projects", value: stats.totalProjects, icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Active Clients", value: stats.activeClients, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Pending Briefs", value: stats.pendingBriefs, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage your agency, clients, and projects.</p>
            </motion.div>

            {/* Stats Grid */}
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

            {/* Recent Projects */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Recent Projects</h2>
                    <Link to="/dashboard/admin/projects" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                <div className="divide-y divide-border">
                    {recentProjects.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No projects found.</div>
                    ) : (
                        recentProjects.map((project) => (
                            <div key={project.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                <div>
                                    <h3 className="font-medium text-foreground">{project.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">Client: {project.profiles?.full_name || 'Unknown'}</span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                    ${project.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                                            project.status === 'active' ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-500/10 text-gray-600'}`}>
                                        {project.status}
                                    </span>
                                    <Link to={`/dashboard/admin/projects/${project.id}`} className="text-sm font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                                        Manage
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
