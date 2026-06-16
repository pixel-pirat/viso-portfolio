import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { StudioProvider } from "./store/StudioStore";
import { AdminAuthProvider } from "./admin/AdminAuth";
import NotificationsBridge from "./components/NotificationsBridge";
import RemindersScheduler from "./components/RemindersScheduler";
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
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProjectsAdmin from "./admin/ProjectsAdmin";
import ServicesAdmin from "./admin/ServicesAdmin";
import BlogAdmin from "./admin/BlogAdmin";
import HeroAdmin from "./admin/HeroAdmin";
import BookingsAdmin from "./admin/BookingsAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import AnalyticsAdmin from "./admin/AnalyticsAdmin";
import SettingsAdmin from "./admin/SettingsAdmin";
import ProposalsAdmin from "./admin/ProposalsAdmin";
import ClientProjectsAdmin from "./admin/ClientProjectsAdmin";
import AppointmentsAdmin from "./admin/AppointmentsAdmin";
import PortalLayout from "./portal/PortalLayout";
import PortalDashboard from "./portal/PortalDashboard";
import PortalProjects from "./portal/PortalProjects";
import PortalProjectDetail from "./portal/PortalProjectDetail";
import PortalProposals from "./portal/PortalProposals";
import PortalAppointments from "./portal/PortalAppointments";
import PortalCollaborations from "./portal/PortalCollaborations";
import Collaborations from "./pages/Collaborations";
import CollaborationDetail from "./pages/CollaborationDetail";
import CollaborationsAdmin from "./admin/CollaborationsAdmin";
import MigrateAdmin from "./admin/MigrateAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <StudioProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationsBridge />
            <RemindersScheduler />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:slug" element={<ProjectDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>

                <Route path="/collaborations" element={<Collaborations />} />
                <Route path="/collaborations/:id" element={<CollaborationDetail />} />

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="projects" element={<ProjectsAdmin />} />
                  <Route path="services" element={<ServicesAdmin />} />
                  <Route path="blog" element={<BlogAdmin />} />
                  <Route path="hero" element={<HeroAdmin />} />
                  <Route path="bookings" element={<BookingsAdmin />} />
                  <Route path="proposals" element={<ProposalsAdmin />} />
                  <Route path="client-projects" element={<ClientProjectsAdmin />} />
                  <Route path="appointments" element={<AppointmentsAdmin />} />
                  <Route path="collaborations" element={<CollaborationsAdmin />} />
                  <Route path="migrate" element={<MigrateAdmin />} />
                  <Route path="users" element={<UsersAdmin />} />
                  <Route path="analytics" element={<AnalyticsAdmin />} />
                  <Route path="settings" element={<SettingsAdmin />} />
                </Route>

                <Route path="/portal" element={<PortalLayout />}>
                  <Route index element={<PortalDashboard />} />
                  <Route path="projects" element={<PortalProjects />} />
                  <Route path="projects/:id" element={<PortalProjectDetail />} />
                  <Route path="proposals" element={<PortalProposals />} />
                  <Route path="appointments" element={<PortalAppointments />} />
                  <Route path="collaborations" element={<PortalCollaborations />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminAuthProvider>
      </StudioProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
