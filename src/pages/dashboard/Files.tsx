import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Download, Loader2, FolderOpen } from "lucide-react";

type FileRow = {
    id: string;
    file_name: string;
    file_url: string;
    type: "concept" | "final";
    uploaded_at: string;
    projects: { title: string } | null;
};

const typeConfig = {
    concept: { label: "Concept", color: "bg-purple-500/10 text-purple-600" },
    final: { label: "Final", color: "bg-green-500/10 text-green-600" },
};

const Files = () => {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!user) return;

            // Fetch files for all projects belonging to this client
            const { data, error } = await supabase
                .from("files")
                .select("*, projects!inner(title, client_id)")
                .eq("projects.client_id", user.id)
                .order("uploaded_at", { ascending: false });

            if (error) console.error("Error fetching files:", error);
            else setFiles(data || []);
            setLoading(false);
        };
        fetchFiles();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Files</h1>
                <p className="text-muted-foreground mt-1">
                    All deliverables and concepts shared by the team.
                </p>
            </motion.div>

            {files.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border p-12 text-center"
                >
                    <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
                    <p className="text-muted-foreground text-sm">
                        Files shared by the team will appear here once your project is underway.
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {files.map((file) => {
                                const type = typeConfig[file.type] ?? typeConfig.concept;
                                return (
                                    <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <FileText size={16} className="text-muted-foreground shrink-0" />
                                                <span className="font-medium">{file.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {file.projects?.title || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${type.color}`}>
                                                {type.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(file.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                                            >
                                                <Download size={14} />
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </motion.div>
            )}
        </div>
    );
};

export default Files;
