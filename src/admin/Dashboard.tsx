import { useStudio } from "@/store/StudioStore";
import { PageHeader, StatCard } from "./components/AdminUI";
import { Briefcase, BookOpen, Calendar, Wrench, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { state } = useStudio();
  const newBookings = state.bookings.filter((b) => b.status === "new").length;
  const wonBookings = state.bookings.filter((b) => b.status === "won").length;
  const publishedPosts = state.posts.filter((p) => p.isPublished).length;
  const featured = state.projects.filter((p) => p.isFeatured).length;

  const recent = [...state.bookings]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Snapshot of your studio — content, leads, and activity."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={state.projects.length} hint={`${featured} featured`} />
        <StatCard label="Services" value={state.services.length} hint="with tiered packages" />
        <StatCard label="Blog posts" value={publishedPosts} hint={`${state.posts.length} total`} />
        <StatCard label="New bookings" value={newBookings} hint={`${wonBookings} won`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2 surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent bookings</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((b) => {
                const svc = state.services.find((s) => s.slug === b.serviceSlug);
                const tier = svc?.tiers.find((t) => t.id === b.tierId);
                return (
                  <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.name} · <span className="text-muted-foreground text-sm">{b.email}</span></div>
                      <div className="text-xs text-muted-foreground truncate">
                        {svc?.title} — {tier?.name} ({tier?.price})
                      </div>
                    </div>
                    <span className="text-[11px] uppercase tracking-wider px-2 py-1 rounded-full bg-secondary border border-border">
                      {b.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/admin/bookings" className="text-sm text-primary mt-4 inline-block">All bookings →</Link>
        </div>

        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Activity feed</h2>
          <ul className="space-y-3">
            {state.hero.activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-secondary border border-border text-primary shrink-0">
                  {a.kind === "project" ? <Briefcase size={13} /> :
                   a.kind === "blog" ? <BookOpen size={13} /> :
                   a.kind === "service" ? <Wrench size={13} /> : <Sparkles size={13} />}
                </span>
                <div>
                  <div>{a.text}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <Link to="/admin/projects" className="surface-card p-5 flex items-center gap-3 hover:border-primary/40">
          <Briefcase size={18} className="text-primary" /> Manage projects
        </Link>
        <Link to="/admin/blog" className="surface-card p-5 flex items-center gap-3 hover:border-primary/40">
          <BookOpen size={18} className="text-primary" /> Write a post
        </Link>
        <Link to="/admin/users" className="surface-card p-5 flex items-center gap-3 hover:border-primary/40">
          <Users size={18} className="text-primary" /> Invite a user
        </Link>
      </div>
    </>
  );
};

export default Dashboard;
