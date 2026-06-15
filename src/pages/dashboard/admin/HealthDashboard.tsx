import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from "recharts";

type HealthData = {
    avgStageTime: { stage: string; days: number }[];
    capacity: { name: string; projectsCount: number }[];
    recentVelocity: { week: string; completedTasks: number }[];
};

export default function HealthDashboard() {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealthData = async () => {
            // Mocking health data for now since we don't have historical stage timestamps tracked in DB yet.
            // In a real scenario, we would calculate this from an 'audit_logs' table or similar.
            
            // 1. Team Capacity
            const { data: teamProjects } = await supabase.from('project_creatives')
                .select('creative_id, profiles(full_name)');
                
            const capacityMap: Record<string, number> = {};
            teamProjects?.forEach((p: any) => {
                const name = p.profiles?.full_name || 'Unknown';
                capacityMap[name] = (capacityMap[name] || 0) + 1;
            });
            const capacityData = Object.entries(capacityMap).map(([name, count]) => ({ name, projectsCount: count }));

            setData({
                avgStageTime: [
                    { stage: "Brief", days: 1.2 },
                    { stage: "Concepts", days: 3.5 },
                    { stage: "Refinement", days: 2.1 },
                    { stage: "Finalisation", days: 1.0 }
                ],
                capacity: capacityData.length > 0 ? capacityData : [
                    { name: "John D.", projectsCount: 4 },
                    { name: "Sarah M.", projectsCount: 2 },
                    { name: "Ahmed K.", projectsCount: 6 }
                ],
                recentVelocity: [
                    { week: "Wk 1", completedTasks: 12 },
                    { week: "Wk 2", completedTasks: 18 },
                    { week: "Wk 3", completedTasks: 15 },
                    { week: "Wk 4", completedTasks: 22 }
                ]
            });
            setLoading(false);
        };
        fetchHealthData();
    }, []);

    if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading health metrics...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Activity className="text-indigo-500" size={20} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Agency Health Dashboard</h1>
                </div>
                <p className="text-muted-foreground">Monitor team capacity, project velocity, and potential bottlenecks.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Velocity Line Chart */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-500" /> Weekly Velocity (Tasks)
                        </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data?.recentVelocity}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                            <Line type="monotone" dataKey="completedTasks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Team Capacity Bar Chart */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Users size={16} className="text-purple-500" /> Creative Team Capacity
                        </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data?.capacity} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                            <Bar dataKey="projectsCount" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Average Stage Time */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Clock size={16} className="text-orange-500" /> Average Days in Stage
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {data?.avgStageTime.map((stage, idx) => (
                            <div key={stage.stage} className="bg-muted/30 border border-border rounded-xl p-4 text-center">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{stage.stage}</p>
                                <p className={`text-3xl font-bold ${stage.days > 3 ? 'text-red-500' : 'text-foreground'}`}>
                                    {stage.days} <span className="text-sm font-medium text-muted-foreground">days</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
