import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type Task = {
    id: string;
    title: string;
    description: string | null;
    status: "todo" | "doing" | "done";
    project_id: string;
    project?: { title: string };
};

export type ProjectMessage = {
    id: string;
    sender_id: string;
    project_id: string;
    message: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string };
};

export type GroupedProject = {
    id: string;
    title: string;
    creative_brief?: any;
    tasks: Task[];
    messages: ProjectMessage[];
};

export type CannedResponse = {
    id: string;
    shortcut: string;
    response_text: string;
};

export const useCreativeProjects = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["creative-projects", userId],
        enabled: !!userId,
        queryFn: async () => {
            const [cannedRes, projectLinksRes, assignedTasksRes] = await Promise.all([
                supabase.from("canned_responses").select("*").order("shortcut"),
                supabase.from("project_creatives").select("projects(id, title, creative_brief, created_at, tasks(*), project_messages(*, profiles(full_name, avatar_url)))").eq("creative_id", userId!),
                supabase.from("tasks").select("*, projects(id, title, creative_brief)").eq("assigned_to", userId!)
            ]);

            const cannedResponses = cannedRes.data || [];

            const projects = (projectLinksRes.data || [])
                .map((link: any) => link.projects)
                .filter(Boolean)
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            const mapped: GroupedProject[] = (projects || []).map((p: any) => ({
                id: p.id,
                title: p.title,
                creative_brief: p.creative_brief,
                tasks: p.tasks || [],
                messages: p.project_messages?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []
            }));

            const assignedTasks = assignedTasksRes.data || [];
            if (assignedTasks.length > 0) {
                const extraProjIds = [...new Set(assignedTasks.map(t => t.project_id))].filter(id => !mapped.some(p => p.id === id));
                
                if (extraProjIds.length > 0) {
                    const { data: rawMessages } = await supabase.from("project_messages").select("*, profiles(full_name, avatar_url)").in("project_id", extraProjIds).order("created_at", { ascending: true });
                    const safeMsgs = rawMessages || [];

                    assignedTasks.forEach((t: any) => {
                        const existing = mapped.find(p => p.id === t.project_id);
                        if (!existing && t.projects) {
                            mapped.push({
                                id: t.project_id,
                                title: t.projects.title,
                                creative_brief: t.projects.creative_brief,
                                tasks: [t],
                                messages: safeMsgs.filter(m => m.project_id === t.project_id) as any
                            });
                        } else if (existing && !existing.tasks.find(tk => tk.id === t.id)) {
                            existing.tasks.push(t);
                        }
                    });
                }
            }

            return {
                groupedProjects: mapped,
                cannedResponses
            };
        },
        staleTime: 5 * 60 * 1000,
    });
};
