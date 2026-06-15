import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type RecentProject = {
    id: string;
    title: string;
    status: "onboarding" | "active" | "completed";
    created_at: string;
    total_price: number;
    profiles: { full_name: string | null } | null;
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            // Fetch recent projects with profiles
            const { data: projects, error: projectsError } = await supabase
                .from("projects")
                .select("*, profiles!client_id(full_name)")
                .order("created_at", { ascending: false })
                .limit(5);

            if (projectsError) throw projectsError;

            // Fetch ALL projects for aggregations
            const { data: allProjects, error: allProjectsError } = await supabase
                .from("projects")
                .select("id, status, total_price, created_at");

            if (allProjectsError) throw allProjectsError;

            // Counts
            const [projectResult, clientResult, pendingResult] = await Promise.all([
                supabase.from("projects").select("*", { count: "exact", head: true }),
                supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
                supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "onboarding"),
            ]);

            // Real revenue aggregation
            const totalRevenue = (allProjects ?? []).reduce((sum, p) => sum + (p.total_price ?? 0), 0);

            // Status chart data
            const statusCounts: Record<string, number> = { onboarding: 0, active: 0, completed: 0 };
            (allProjects ?? []).forEach((p) => { if (statusCounts[p.status] !== undefined) statusCounts[p.status]++; });

            // Revenue by month — last 6 months
            const monthMap: Record<string, number> = {};
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
                monthMap[key] = 0;
            }
            (allProjects ?? []).forEach((p) => {
                const d = new Date(p.created_at);
                const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
                if (key in monthMap) monthMap[key] += p.total_price ?? 0;
            });

            return {
                recentProjects: (projects as RecentProject[]) ?? [],
                allProjects: allProjects ?? [],
                stats: {
                    totalProjects: projectResult.count ?? 0,
                    activeClients: clientResult.count ?? 0,
                    totalRevenue,
                    pendingBriefs: pendingResult.count ?? 0,
                },
                statusCounts,
                revenueByMonth: monthMap
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
};
