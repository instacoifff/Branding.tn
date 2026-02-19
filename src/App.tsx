import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ProjectBuilder from "./pages/ProjectBuilder";
import Auth from "./pages/Auth";
import CreativeBrief from "./pages/CreativeBrief";
import Overview from "./pages/dashboard/Overview";
import Projects from "./pages/dashboard/Projects";
import Files from "./pages/dashboard/Files";
import AdminOverview from "./pages/dashboard/admin/AdminOverview";
import AllProjects from "./pages/dashboard/admin/AllProjects";
import UsersList from "./pages/dashboard/admin/UsersList";
import FilesVault from "./pages/dashboard/admin/FilesVault";
import AdminProjectDetail from "./pages/dashboard/admin/AdminProjectDetail";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { I18nProvider } from "./i18n";

const queryClient = new QueryClient();

// Lightweight admin guard — no layout, just a role check
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <I18nProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/builder" element={<ProjectBuilder />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/brief" element={<CreativeBrief />} />

              {/* Dashboard — requires auth, renders shared DashboardLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Client routes */}
                <Route index element={<Overview />} />
                <Route path="projects" element={<Projects />} />
                <Route path="files" element={<Files />} />

                {/* Admin routes — additionally requires admin role */}
                <Route path="admin" element={<AdminGuard><AdminOverview /></AdminGuard>} />
                <Route path="admin/projects" element={<AdminGuard><AllProjects /></AdminGuard>} />
                <Route path="admin/projects/:id" element={<AdminGuard><AdminProjectDetail /></AdminGuard>} />
                <Route path="admin/users" element={<AdminGuard><UsersList /></AdminGuard>} />
                <Route path="admin/files" element={<AdminGuard><FilesVault /></AdminGuard>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </I18nProvider>
);

export default App;
