import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/builder" element={<ProjectBuilder />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/brief" element={<CreativeBrief />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="files" element={<Files />} />

              {/* Admin Routes */}
              <Route path="admin">
                <Route index element={<AdminOverview />} />
                <Route path="projects" element={<AllProjects />} />
                <Route path="users" element={<UsersList />} />
                <Route path="files" element={<FilesVault />} />
              </Route>
            </Route>
            {/* Redirect /dashboard to /dashboard/ if accessed directly without trailing slash is handled by Router, but good to check */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
