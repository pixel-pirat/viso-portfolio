import { useProjects } from "@/lib/useData";
import { useBookings } from "@/lib/useData";
import { useServices } from "@/lib/useData";
import { PageHeader, StatCard } from "./components/AdminUI";
import { Loader2 } from "lucide-react";

const Bar = ({ value, max, label }: { value: number; max: number; label: string }) => (
  <div>
    <div className="flex justify-between text-xs text-muted-foreground mb-1">
      <span>{label}</span><span>{value}</span>
    </div>
    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div className="h-full bg-gradient-primary" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  </div>
);

const AnalyticsAdmin = () => {
  const { data: projects = [], isLoading: loadingProjects } = useProjects(undefined, true);
  const { data: bookings = [], isLoading: loadingBookings } = useBookings("all");
  const { data: services = [], isLoading: loadingServices } = useServices(true);

  if (loadingProjects || loadingBookings || loadingServices) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  // Mock analytics derived from live data
  const visits = 12480;
  const conv = bookings.length;
  const won = bookings.filter((b: any) => b.status === "won").length;
  const convRate = ((conv / visits) * 100).toFixed(2);

  const byCategory = projects.reduce<Record<string, number>>((acc, p: any) => {
    acc[p.category] = (acc[p.category] || 0) + 1; return acc;
  }, {});
  const maxCat = Math.max(1, ...Object.values(byCategory));

  const byService = services.map((s: any) => ({
    title: s.title.split(" / ")[0],
    bookings: bookings.filter((b: any) => b.serviceSlug === s.slug).length,
  }));
  const maxSvc = Math.max(1, ...byService.map((x: any) => x.bookings));

  const byStatus = (["new", "in_review", "replied", "won", "lost"] as const).map((st) => ({
    st, count: bookings.filter((b: any) => b.status === st).length,
  }));

  return (
    <>
      <PageHeader title="Analytics" description="Mock analytics for the demo. Hook a real provider once you enable a backend." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visits (30d)" value={visits.toLocaleString()} hint="+12% vs prev" />
        <StatCard label="Bookings" value={conv} hint={`${convRate}% conv rate`} />
        <StatCard label="Won" value={won} hint={`${conv ? Math.round((won / conv) * 100) : 0}% close rate`} />
        <StatCard label="Avg. session" value="2:14" hint="3.2 pages/visit" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Projects by category</h2>
          <div className="space-y-3">
            {Object.entries(byCategory).map(([k, v]) => <Bar key={k} label={k} value={v} max={maxCat} />)}
          </div>
        </div>
        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Bookings by service</h2>
          <div className="space-y-3">
            {byService.map((b: any) => <Bar key={b.title} label={b.title} value={b.bookings} max={maxSvc} />)}
          </div>
        </div>
      </div>

      <div className="surface-card p-6 mt-5">
        <h2 className="font-display text-lg font-semibold mb-4">Booking pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {byStatus.map((s) => (
            <div key={s.st} className="rounded-xl border border-border p-4 text-center">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.st}</div>
              <div className="font-display text-3xl font-bold mt-1">{s.count}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnalyticsAdmin;
