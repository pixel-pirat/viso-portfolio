import { useMemo, useState } from "react";
import { useStudio } from "@/store/StudioStore";
import { useAdminAuth } from "./AdminAuth";
import { useApi } from "@/lib/useApi";
import { PageHeader, EmptyState } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, CalendarClock, Pencil } from "lucide-react";
import type { Appointment, AppointmentStatus } from "@/store/types";
import { realtime } from "@/lib/realtime";
import { toast } from "sonner";

const statusColor: Record<AppointmentStatus, string> = {
  pending: "bg-secondary text-foreground border border-border",
  confirmed: "bg-emerald-500 text-white",
  declined: "bg-destructive text-destructive-foreground",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-secondary text-muted-foreground border border-border",
};

const AppointmentsAdmin = () => {
  const { state } = useStudio();
  const { updateAppointment } = useApi();
  const [reschedule, setReschedule] = useState<Appointment | null>(null);

  const upcoming = useMemo(
    () => [...state.appointments].sort((a, b) => +new Date(`${a.date}T${a.time}`) - +new Date(`${b.date}T${b.time}`)),
    [state.appointments],
  );

  const update = (id: string, patch: Partial<Appointment>) => updateAppointment(id, patch);

  const decide = (a: Appointment, status: AppointmentStatus) => {
    update(a.id, { status });
    if (a.clientId) {
      realtime.publish({
        kind: "appointment",
        title: `Appointment ${status}`,
        body: `${new Date(`${a.date}T${a.time}`).toLocaleString()} — ${status === "confirmed" ? "see you soon!" : "let us know if you'd like to reschedule."}`,
        audience: a.clientId,
        href: "/portal",
      });
    }
    toast.success(`Marked as ${status}`);
  };

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Review, confirm or reschedule client requests."
      />

      {upcoming.length === 0 ? (
        <EmptyState title="No appointments yet" description="Client appointment requests will appear here." />
      ) : (
        <div className="surface-card p-2 divide-y divide-border">
          {upcoming.map((a) => (
            <div key={a.id} className="p-4 flex flex-wrap items-start gap-4 justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor[a.status]}`}>{a.status}</span>
                  <span className="font-medium text-sm">{a.clientName}</span>
                  <span className="text-xs text-muted-foreground">{a.clientEmail}</span>
                </div>
                <div className="font-display text-base font-semibold mt-1">
                  {new Date(`${a.date}T${a.time}`).toLocaleString()} · {a.durationMin}min
                </div>
                {a.serviceSlug && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Service: {state.services.find((s) => s.slug === a.serviceSlug)?.title ?? a.serviceSlug}
                  </div>
                )}
                {a.notes && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{a.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.status === "pending" && (
                  <>
                    <Button size="sm" variant="hero" onClick={() => decide(a, "confirmed")}><CheckCircle2 size={14} /> Confirm</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => decide(a, "declined")}><XCircle size={14} /> Decline</Button>
                  </>
                )}
                {a.status === "confirmed" && (
                  <Button size="sm" variant="outline" onClick={() => decide(a, "completed")}>Mark complete</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setReschedule(a)}>
                  <CalendarClock size={14} /> Reschedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RescheduleDialog
        appointment={reschedule}
        onClose={() => setReschedule(null)}
        onSave={(date, time, durationMin) => {
          if (!reschedule) return;
          update(reschedule.id, { date, time, durationMin, status: "confirmed" });
          if (reschedule.clientId) {
            realtime.publish({
              kind: "appointment",
              title: "Appointment rescheduled",
              body: `New time: ${new Date(`${date}T${time}`).toLocaleString()}`,
              audience: reschedule.clientId,
              href: "/portal",
            });
          }
          toast.success("Appointment rescheduled");
          setReschedule(null);
        }}
      />
    </>
  );
};

const RescheduleDialog = ({
  appointment, onClose, onSave,
}: {
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (date: string, time: string, durationMin: number) => void;
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);

  return (
    <Dialog open={!!appointment} onOpenChange={(v) => {
      if (v && appointment) {
        setDate(appointment.date);
        setTime(appointment.time);
        setDuration(appointment.durationMin);
      } else {
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Reschedule appointment</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSave(date, time, duration); }}>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90].map((n) => <SelectItem key={n} value={String(n)}>{n} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button type="submit" variant="hero">Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentsAdmin;
