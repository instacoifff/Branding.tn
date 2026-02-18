import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";

const Overview = () => {
  const { user } = useAuth();
  const { t } = useI18n();
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
      if (error) console.error('Error fetching projects:', error);
      else setProjects(data || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.overview")}</h1>
        <p className="text-muted-foreground mt-2">{t("dashboard.welcome")} 👋</p>
      </motion.div>

      {projects.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-10 text-center">
          <FolderOpen size={40} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("dashboard.noProjects")}</h3>
          <p className="text-muted-foreground mb-6 text-sm">{t("dashboard.projectsPage.noProjectsDesc")}</p>
          <Link to="/builder" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
            {t("dashboard.startProject")}
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
                    {t(`dashboard.status.${project.status}`) || project.status}
                  </span>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock size={13} />
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link to={`/dashboard/projects/${project.id}`} className="text-sm font-medium text-primary hover:underline">
                  {t("dashboard.viewAll")}
                </Link>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(project.current_stage / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{t("dashboard.stage")} {project.current_stage} {t("dashboard.projectsPage.of")} 5</span>
                <span>{project.current_stage * 20}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;
