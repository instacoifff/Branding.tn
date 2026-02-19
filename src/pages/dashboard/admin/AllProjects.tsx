import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

type Project = {
    id: string;
    title: string;
    status: string;
    current_stage: number;
    created_at: string;
    profiles: { full_name: string } | null;
};

const AllProjects = () => {
    const { t } = useI18n();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchProjects = async () => {
        setLoading(true);
        let query = supabase
            .from('projects')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });

        if (filter !== "all") {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setProjects(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchProjects(); }, [filter]);

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.adminProjects.title")}</h1>
                    <p className="text-muted-foreground mt-1">{t("dashboard.adminProjects.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder={t("dashboard.adminProjects.search")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">{t("dashboard.status.all") || "All"}</option>
                        <option value="active">{t("dashboard.status.active")}</option>
                        <option value="completed">{t("dashboard.status.completed")}</option>
                        <option value="onboarding">{t("dashboard.status.onboarding")}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">{t("dashboard.adminProjects.project")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminProjects.client")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminProjects.status")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminProjectDetail.stage")}</th>
                                <th className="px-6 py-4">{t("dashboard.adminProjects.created")}</th>
                                <th className="px-6 py-4 text-right">{t("dashboard.adminProjects.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-medium">{project.title}</td>
                                    <td className="px-6 py-4">{project.profiles?.full_name || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize 
                         ${project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                project.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {t(`dashboard.status.${project.status}`) || project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{t("dashboard.adminProjectDetail.stage")} {project.current_stage}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/dashboard/admin/projects/${project.id}`} className="text-primary hover:underline font-medium">
                                            {t("dashboard.adminProjects.edit")}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredProjects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">{t("dashboard.adminProjects.noProjects")}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllProjects;
