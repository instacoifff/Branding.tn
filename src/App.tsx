import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { I18nProvider } from "./i18n";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

// Lazy-load all dashboard components
const DashboardOverview = lazy(() => import("./pages/dashboard/Overview"));
const Projects = lazy(() => import("./pages/dashboard/Projects"));
const ProjectDetail = lazy(() => import("./pages/dashboard/ProjectDetail"));
const Files = lazy(() => import("./pages/dashboard/Files"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const UnifiedInbox = lazy(() => import("./pages/dashboard/UnifiedInbox"));

const AdminOverview = lazy(() => import("./pages/dashboard/admin/AdminOverview"));
const AllProjects = lazy(() => import("./pages/dashboard/admin/AllProjects"));
const AdminProjectDetail = lazy(() => import("./pages/dashboard/admin/AdminProjectDetail"));
const UsersList = lazy(() => import("./pages/dashboard/admin/UsersList"));
const FilesVault = lazy(() => import("./pages/dashboard/admin/FilesVault"));

const CreativeOverview = lazy(() => import("./pages/dashboard/creative/CreativeOverview"));

const Index = lazy(() => import("./pages/Index"));
const ProjectBuilder = lazy(() => import("./pages/ProjectBuilder"));
const Auth = lazy(() => import("./pages/Auth"));
const CreativeBrief = lazy(() => import("./pages/CreativeBrief"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Guards as function declarations for hoisting
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function CreativeGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role !== "creative" && profile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function ClientGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile?.role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (profile?.role === "creative") return <Navigate to="/dashboard/creative" replace />;
  return <>{children}</>;
}

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={
                <div className="h-screen w-screen flex items-center justify-center bg-background">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading experience...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/builder" element={<ProjectBuilder />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/brief" element={<CreativeBrief />} />

                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    {/* Client */}
                    <Route index element={<ClientGuard><DashboardOverview /></ClientGuard>} />
                    <Route path="projects" element={<ClientGuard><Projects /></ClientGuard>} />
                    <Route path="projects/:id" element={<ClientGuard><ProjectDetail /></ClientGuard>} />
                    <Route path="inbox" element={<ClientGuard><UnifiedInbox /></ClientGuard>} />
                    <Route path="files" element={<ClientGuard><Files /></ClientGuard>} />
                    <Route path="settings" element={<Settings />} />

                    {/* Creative */}
                    <Route path="creative" element={<CreativeGuard><CreativeOverview /></CreativeGuard>} />
                    <Route path="creative/projects/:id" element={<CreativeGuard><AdminProjectDetail /></CreativeGuard>} />
                    <Route path="creative/inbox" element={<CreativeGuard><UnifiedInbox /></CreativeGuard>} />

                    {/* Admin */}
                    <Route path="admin" element={<AdminGuard><AdminOverview /></AdminGuard>} />
                    <Route path="admin/inbox" element={<AdminGuard><UnifiedInbox /></AdminGuard>} />
                    <Route path="admin/projects" element={<AdminGuard><AllProjects /></AdminGuard>} />
                    <Route path="admin/projects/:id" element={<AdminGuard><AdminProjectDetail /></AdminGuard>} />
                    <Route path="admin/users" element={<AdminGuard><UsersList /></AdminGuard>} />
                    <Route path="admin/files" element={<AdminGuard><FilesVault /></AdminGuard>} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
