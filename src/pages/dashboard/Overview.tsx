import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Circle, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Overview = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome back to your client portal.</p>
      </motion.div>

      {projects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <h3 className="text-lg font-semibold mb-2">No Active Projects</h3>
          <p className="text-muted-foreground mb-6">Start a new project to see it tracked here.</p>
          <Link to="/builder" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Start Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary mb-2 inline-block capitalize">
                    {project.status}
                  </span>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">Started on {new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <Link to={`/dashboard/projects/${project.id}`} className="text-sm font-medium text-primary hover:underline">
                  View Details
                </Link>
              </div>

              {/* Simple Progress Bar Example */}
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(project.current_stage / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Phase {project.current_stage} of 5</span>
                <span>{project.current_stage * 20}% Complete</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;
