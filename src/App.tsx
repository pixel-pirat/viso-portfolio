import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminAuthProvider } from "./admin/AdminAuth";
import NotificationsBridge from "./components/NotificationsBridge";
import RemindersScheduler from "./components/RemindersScheduler";

// ─── Public pages — eager loaded (small, needed immediately) ─
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound.tsx";

// ─── Collaborations — lazy (not on critical path) ────────────
const Collaborations = lazy(() => import("./pages/Collaborations"));
const CollaborationDetail = lazy(() => import("./pages/CollaborationDetail"));

// ─── Admin — lazy chunk (only loaded when visiting /admin) ───
const AdminLayout       = lazy(() => import("./admin/AdminLayout"));
const Dashboard         = lazy(() => import("./admin/Dashboard"));
const ProjectsAdmin     = lazy(() => import("./admin/ProjectsAdmin"));
const ServicesAdmin     = lazy(() => import("./admin/ServicesAdmin"));
const BlogAdmin         = lazy(() => import("./admin/BlogAdmin"));
const HeroAdmin         = lazy(() => import("./admin/HeroAdmin"));
const BookingsAdmin     = lazy(() => import("./admin/BookingsAdmin"));
const UsersAdmin        = lazy(() => import("./admin/UsersAdmin"));
const AnalyticsAdmin    = lazy(() => import("./admin/AnalyticsAdmin"));
const SettingsAdmin     = lazy(() => import("./admin/SettingsAdmin"));
const ProposalsAdmin    = lazy(() => import("./admin/ProposalsAdmin"));
const ClientProjectsAdmin = lazy(() => import("./admin/ClientProjectsAdmin"));
const AppointmentsAdmin = lazy(() => import("./admin/AppointmentsAdmin"));
const CollaborationsAdmin = lazy(() => import("./admin/CollaborationsAdmin"));
const MigrateAdmin      = lazy(() => import("./admin/MigrateAdmin"));

// ─── Portal — lazy chunk (only loaded when visiting /portal) ─
const PortalLayout       = lazy(() => import("./portal/PortalLayout"));
const PortalDashboard    = lazy(() => import("./portal/PortalDashboard"));
const PortalProjects     = lazy(() => import("./portal/PortalProjects"));
const PortalProjectDetail = lazy(() => import("./portal/PortalProjectDetail"));
const PortalProposals    = lazy(() => import("./portal/PortalProposals"));
const PortalAppointments = lazy(() => import("./portal/PortalAppointments"));
const PortalCollaborations = lazy(() => import("./portal/PortalCollaborations"));

// ─── Loading fallback ─────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen grid place-items-center bg-background">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationsBridge />
          <RemindersScheduler />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public ── */}
                <Route element={<Layout />}>
                  <Route path="/"               element={<Home />} />
                  <Route path="/services"       element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/projects"       element={<Projects />} />
                  <Route path="/projects/:slug" element={<ProjectDetail />} />
                  <Route path="/about"          element={<About />} />
                  <Route path="/blog"           element={<Blog />} />
                  <Route path="/blog/:slug"     element={<BlogDetail />} />
                  <Route path="/contact"        element={<Contact />} />
                </Route>

                <Route path="/collaborations"     element={<Collaborations />} />
                <Route path="/collaborations/:id" element={<CollaborationDetail />} />

                {/* ── Admin ── */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index                  element={<Dashboard />} />
                  <Route path="projects"        element={<ProjectsAdmin />} />
                  <Route path="services"        element={<ServicesAdmin />} />
                  <Route path="blog"            element={<BlogAdmin />} />
                  <Route path="hero"            element={<HeroAdmin />} />
                  <Route path="bookings"        element={<BookingsAdmin />} />
                  <Route path="proposals"       element={<ProposalsAdmin />} />
                  <Route path="client-projects" element={<ClientProjectsAdmin />} />
                  <Route path="appointments"    element={<AppointmentsAdmin />} />
                  <Route path="collaborations"  element={<CollaborationsAdmin />} />
                  <Route path="migrate"         element={<MigrateAdmin />} />
                  <Route path="users"           element={<UsersAdmin />} />
                  <Route path="analytics"       element={<AnalyticsAdmin />} />
                  <Route path="settings"        element={<SettingsAdmin />} />
                </Route>

                {/* ── Portal ── */}
                <Route path="/portal" element={<PortalLayout />}>
                  <Route index                element={<PortalDashboard />} />
                  <Route path="projects"      element={<PortalProjects />} />
                  <Route path="projects/:id"  element={<PortalProjectDetail />} />
                  <Route path="proposals"     element={<PortalProposals />} />
                  <Route path="appointments"  element={<PortalAppointments />} />
                  <Route path="collaborations" element={<PortalCollaborations />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
