import { useProjects, useServices, usePosts, useBookings, useHero } from "@/lib/useData";
import { PageHeader, StatCard } from "./components/AdminUI";
import { Briefcase, BookOpen, Calendar, Wrench, Users, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: projects = [], isLoading: loadingProjects } = useProjects(undefined, true);
  const { data: services = [], isLoading: loadingServices } = useServices(true);
  const { data: posts = [], isLoading: loadingPosts } = usePosts(undefined, true);
  const { data: bookingsData = [], isLoading: loadingBookings } = useBookings("all");
  const { data: heroData, isLoading: loadingHero } = useHero();

  const isLoading = loadingProjects || loadingServices || loadingPosts || loadingBookings || loadingHero;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const newBookings = (bookingsData as any[]).filter((b) => b.status === "new").length;
  const wonBookings = (bookingsData as any[]).filter((b) => b.status === "won").length;
  const publishedPosts = (posts as any[]).filter((p) => p.isPublished).length;
  const featured = (projects as any[]).filter((p) => p.isFeatured).length;

  const recent = [...(bookingsData as any[])]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  const activity = heroData?.activity ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Snapshot of your studio — content, leads, and activity."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={(projects as any[]).length} hint={`${featured} featured`} />
        <StatCard label="Services" value={(services as any[]).length} hint="with tiered packages" />
        <StatCard label="Blog posts" value={publishedPosts} hint={`${(posts as any[]).length} total`} />
        <StatCard label="New bookings" value={newBookings} hint={`${wonBookings} won`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        <div className="lg:col-span-2 surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Recent bookings</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((b: any) => {
                const svc = (services as any[]).find((s) => s.slug === b.serviceSlug);
                const tier = svc?.tiers?.find((t: any) => t.id === b.tierId);
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
            {activity.slice(0, 6).map((a: any) => (
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
            {activity.length === 0 && <li className="text-sm text-muted-foreground">No recent activity.</li>}
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
