import { supabase } from './supabase';

// Define types for better type safety
export type Service = { id: string; price: number;[key: string]: any };
export type ProjectDraft = { client_id: string; title: string; services_selected: Service[]; total_price: number };

/**
 * 1. createInitialProject
 * Creates a project draft before the 30% payment.
 */
export async function createInitialProject(draft: ProjectDraft) {
    const { data, error } = await supabase
        .from('projects')
        .insert({
            client_id: draft.client_id,
            title: draft.title,
            services_selected: draft.services_selected,
            total_price: draft.total_price,
            deposit_paid: false,
            status: 'onboarding',
            current_stage: 1,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        throw error;
    }

    return data;
}

/**
 * 2. calculateProgress
 * Looks at the tasks table and returns a percentage (Done/Total).
 */
export async function calculateProgress(projectId: string): Promise<number> {
    // Fetch all tasks for the project
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

    if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }

    if (!tasks || tasks.length === 0) return 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;

    return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * 3. getProjectTeam
 * Fetches all team members assigned to a specific project's tasks.
 */
export async function getProjectTeam(projectId: string) {
    // First, get all unique assigned_to IDs from tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('project_id', projectId)
        .not('assigned_to', 'is', null);

    if (tasksError) {
        console.error('Error fetching project tasks:', tasksError);
        throw tasksError;
    }

    const teamIds = Array.from(new Set(tasks?.map((t) => t.assigned_to).filter(Boolean)));

    if (teamIds.length === 0) return [];

    // Fetch team member details
    const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .in('id', teamIds);

    if (teamError) {
        console.error('Error fetching team members:', teamError);
        throw teamError;
    }

    return teamMembers;
}
