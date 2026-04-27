import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
export type Service = { id: string; price: number;[key: string]: any };

export type ProjectDraft = {
    client_id: string;
    title: string;
    services_selected: Service[];
    total_price: number;
};

export type TaskStatus = 'todo' | 'doing' | 'done';

export type TaskPayload = {
    project_id: string;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    assigned_to?: string | null;
};

// ─────────────────────────────────────────────────────────────
//  Projects
// ─────────────────────────────────────────────────────────────

/**
 * createInitialProject — Creates a project draft before the 30% payment.
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

    if (error) throw error;
    return data;
}

/**
 * updateProjectStatus — Admin updates project status, stage, and deposit flag.
 * Also inserts a notification to the project's client.
 */
export async function updateProjectStatus(
    projectId: string,
    payload: { status: string; current_stage: number; deposit_paid: boolean },
    clientId?: string
) {
    const { error } = await supabase
        .from('projects')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', projectId);

    if (error) throw error;

    // Best-effort notification
    if (clientId) {
        try {
            await supabase.from('notifications').insert({
                user_id: clientId,
                title: 'Project Updated',
                body: `Your project has been updated to stage ${payload.current_stage}. Status: ${payload.status}.`,
                read: false,
            });
        } catch { /* non-critical */ }
    }

}

/**
 * deleteProject — Soft-delete approach: hard deletes the project and cascades via FK.
 */
export async function deleteProject(projectId: string) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
//  Tasks
// ─────────────────────────────────────────────────────────────

/**
 * createTask — Inserts a new task for a project.
 */
export async function createTask(payload: TaskPayload) {
    const { data, error } = await supabase
        .from('tasks')
        .insert({ ...payload, status: payload.status ?? 'todo' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * updateTaskStatus — Cycles through todo → doing → done.
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

    if (error) throw error;
}

/**
 * deleteTask — Removes a task by ID.
 */
export async function deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
//  Progress
// ─────────────────────────────────────────────────────────────

/**
 * calculateProgress — Returns percentage of done tasks for a project.
 */
export async function calculateProgress(projectId: string): Promise<number> {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

    if (error) throw error;
    if (!tasks || tasks.length === 0) return 0;

    const completed = tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / tasks.length) * 100);
}

// ─────────────────────────────────────────────────────────────
//  Files
// ─────────────────────────────────────────────────────────────

/**
 * uploadProjectFile — Uploads a file to Supabase Storage and inserts a files row.
 */
export async function uploadProjectFile(
    projectId: string,
    file: File,
    type: 'concept' | 'final' = 'concept'
) {
    const ext = file.name.split('.').pop();
    const path = `project-files/${projectId}/${Date.now()}_${file.name}`;

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
        .from('project-files')
        .upload(path, file, { upsert: false });

    if (uploadErr) throw uploadErr;

    // Get public URL
    const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(path);

    // Insert file record
    const { data, error: dbErr } = await supabase
        .from('files')
        .insert({
            project_id: projectId,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
            type,
        })
        .select()
        .single();

    if (dbErr) throw dbErr;
    return data;
}

/**
 * deleteFileRecord — Removes a file record from the DB (storage cleanup optional).
 */
export async function deleteFileRecord(fileId: string) {
    const { error } = await supabase.from('files').delete().eq('id', fileId);
    if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
//  Team
// ─────────────────────────────────────────────────────────────

/**
 * getProjectTeam — Fetches all team members assigned to a project's tasks.
 */
export async function getProjectTeam(projectId: string) {
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('project_id', projectId)
        .not('assigned_to', 'is', null);

    if (tasksError) throw tasksError;

    const teamIds = Array.from(new Set(tasks?.map(t => t.assigned_to).filter(Boolean)));
    if (teamIds.length === 0) return [];

    const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .in('id', teamIds);

    if (teamError) throw teamError;
    return teamMembers;
}

// ─────────────────────────────────────────────────────────────
//  Notifications
// ─────────────────────────────────────────────────────────────

/**
 * sendNotification — Sends a notification to a specific user.
 */
export async function sendNotification(
    userId: string,
    title: string,
    body?: string
) {
    const { error } = await supabase
        .from('notifications')
        .insert({ user_id: userId, title, body: body ?? null, read: false });

    if (error) throw error;
}

/**
 * markAllNotificationsRead — Marks all unread notifications for a user as read.
 */
export async function markAllNotificationsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) throw error;
}
