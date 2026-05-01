import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Wrench, BookOpen, Calendar, Users,
  BarChart3, Settings as SettingsIcon, Sparkles, LogOut, ExternalLink,
  FileText, FolderKanban,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuth";
import AdminLogin from "./AdminLogin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudio } from "@/store/StudioStore";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Portfolio", icon: Briefcase },
  { to: "/admin/services", label: "Services & Tiers", icon: Wrench },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/hero", label: "Hero Feed", icon: Sparkles },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/proposals", label: "Proposals", icon: FileText },
  { to: "/admin/client-projects", label: "Client Projects", icon: FolderKanban },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const AdminLayout = () => {
  const { isAuthed, isAdmin, logout, session } = useAdminAuth();
  const { state } = useStudio();
  const navigate = useNavigate();

  if (!isAuthed) return <AdminLogin />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center p-6 bg-background">
        <div className="surface-card p-8 max-w-sm text-center space-y-4">
          <h1 className="font-display text-xl font-bold">Client account detected</h1>
          <p className="text-sm text-muted-foreground">The admin console is for studio staff. Head to your client portal to see your projects.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="hero" onClick={() => navigate("/portal")}>Open client portal</Button>
            <Button variant="ghost" onClick={logout}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  const dev = state.settings.developer;
  const displayName = session?.name || dev.name;
  const initials = displayName.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-card lg:sticky lg:top-0 lg:h-screen flex flex-col">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">◆</span>
          <div>
            <div className="font-display font-bold leading-none">Studio</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )
              }
            >
              <it.icon size={16} />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <NavLink
            to="/admin/settings"
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors"
          >
            <span className="h-9 w-9 rounded-full overflow-hidden border border-border bg-secondary grid place-items-center shrink-0">
              {dev.avatarUrl
                ? <img src={dev.avatarUrl} alt="" className="h-full w-full object-cover" />
                : <span className="text-xs font-bold text-muted-foreground">{initials}</span>}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-[11px] text-muted-foreground truncate capitalize">{session?.role ?? "admin"}</div>
            </div>
          </NavLink>
          <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate("/")}>
            <ExternalLink size={14} /> View site
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="container-studio py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
