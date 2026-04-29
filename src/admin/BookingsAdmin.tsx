import { useState } from "react";
import { useStudio } from "@/store/StudioStore";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { Booking } from "@/store/types";

const STATUSES: Booking["status"][] = ["new", "in_review", "replied", "won", "lost"];

const statusColor: Record<Booking["status"], string> = {
  new: "bg-primary text-primary-foreground",
  in_review: "bg-secondary text-foreground border border-border",
  replied: "bg-accent-purple text-accent-purple-foreground",
  won: "bg-emerald-500 text-white",
  lost: "bg-destructive text-destructive-foreground",
};

const BookingsAdmin = () => {
  const { state, setState } = useStudio();
  const [filter, setFilter] = useState<Booking["status"] | "all">("all");

  const bookings = filter === "all" ? state.bookings : state.bookings.filter((b) => b.status === filter);

  const setStatus = (id: string, status: Booking["status"]) =>
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => b.id === id ? { ...b, status } : b) }));

  const remove = (id: string) =>
    setState((s) => ({ ...s, bookings: s.bookings.filter((b) => b.id !== id) }));

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Inquiries from clients picking a service tier. Track them through your pipeline."
        actions={
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="space-y-3">
        {bookings.length === 0 && <div className="surface-card p-10 text-center text-muted-foreground">No bookings.</div>}
        {bookings.map((b) => {
          const svc = state.services.find((s) => s.slug === b.serviceSlug);
          const tier = svc?.tiers.find((t) => t.id === b.tierId);
          return (
            <div key={b.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mt-2">{b.name} <span className="text-muted-foreground font-normal text-sm">· {b.email}</span></h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    {svc?.title ?? "Unknown service"} — <span className="text-foreground">{tier?.name ?? "Unknown tier"}</span> ({tier?.price ?? "—"})
                  </div>
                  <p className="text-sm mt-3 max-w-2xl">{b.message}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Select value={b.status} onValueChange={(v) => setStatus(b.id, v as Booking["status"])}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="text-destructive justify-start" onClick={() => remove(b.id)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BookingsAdmin;
