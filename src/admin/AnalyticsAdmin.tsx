import { useStudio } from "@/store/StudioStore";
import { PageHeader, StatCard } from "./components/AdminUI";

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
  const { state } = useStudio();

  // Mock analytics derived from store
  const visits = 12480;
  const conv = state.bookings.length;
  const won = state.bookings.filter((b) => b.status === "won").length;
  const convRate = ((conv / visits) * 100).toFixed(2);

  const byCategory = state.projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1; return acc;
  }, {});
  const maxCat = Math.max(1, ...Object.values(byCategory));

  const byService = state.services.map((s) => ({
    title: s.title.split(" / ")[0],
    bookings: state.bookings.filter((b) => b.serviceSlug === s.slug).length,
  }));
  const maxSvc = Math.max(1, ...byService.map((x) => x.bookings));

  const byStatus = (["new", "in_review", "replied", "won", "lost"] as const).map((st) => ({
    st, count: state.bookings.filter((b) => b.status === st).length,
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
            {byService.map((b) => <Bar key={b.title} label={b.title} value={b.bookings} max={maxSvc} />)}
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
