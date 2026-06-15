import { motion } from "framer-motion";
import { Users, FolderKanban, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { useAdminStats } from "@/hooks/queries/useAdminStats";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
} from "recharts";

type RecentProject = {
    id: string;
    title: string;
    status: "onboarding" | "active" | "completed";
    created_at: string;
    total_price: number;
    profiles: { full_name: string | null } | null;
};

const STATUS_COLORS: Record<string, string> = {
    onboarding: "#f97316",
    active: "#3b82f6",
    completed: "#22c55e",
};

const AdminOverview = () => {
    const { t } = useI18n();
    const { data, isLoading } = useAdminStats();

    if (isLoading || !data) return <div className="p-8 text-muted-foreground">{t("common.loading")}</div>;

    const { stats, recentProjects, statusCounts, revenueByMonth } = data;

    const statusData = [
        { name: t("dashboard.status.onboarding"), count: statusCounts.onboarding, fill: STATUS_COLORS.onboarding },
        { name: t("dashboard.status.active"), count: statusCounts.active, fill: STATUS_COLORS.active },
        { name: t("dashboard.status.completed"), count: statusCounts.completed, fill: STATUS_COLORS.completed },
    ];

    const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

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

            {/* KPI stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
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

            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Projects by status */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-xl border border-border p-6 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                        Projects by Status
                    </h2>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={statusData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
                                cursor={{ fill: "hsl(var(--muted))" }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {statusData.map((entry, idx) => (
                                    <rect key={idx} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Revenue trend — last 6 months */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-card rounded-xl border border-border p-6 shadow-sm"
                >
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                        Revenue (Last 6 Months) — TND
                    </h2>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(270 75% 65%)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="hsl(270 75% 65%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }}
                                formatter={(v: number) => [`${v.toLocaleString()} TND`, "Revenue"]}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="hsl(270 75% 65%)" strokeWidth={2} fill="url(#revenueGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Recent projects table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                                        <span className="text-xs text-muted-foreground">{t("dashboard.adminProjects.client")}: {project.profiles?.full_name || "—"}</span>
                                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{project.total_price.toLocaleString()} TND</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${project.status === "completed" ? "bg-green-500/10 text-green-600" : project.status === "active" ? "bg-blue-500/10 text-blue-600" : "bg-gray-500/10 text-gray-600"}`}>
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
