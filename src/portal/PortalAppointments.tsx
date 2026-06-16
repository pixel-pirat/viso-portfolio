import { useState } from "react";
import { useAppointments, useServices } from "@/lib/useData";
import { useApi } from "@/lib/useApi";
import { useAdminAuth } from "@/admin/AdminAuth";
import { PageHeader, EmptyState } from "@/admin/components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Loader2 } from "lucide-react";
import { realtime } from "@/lib/realtime";
import { toast } from "sonner";

const PortalAppointments = () => {
  const { data: appointments = [], isLoading } = useAppointments("mine");
  const { data: services = [] } = useServices();
  const { submitAppointment } = useApi();
  const { session } = useAdminAuth();

  const [serviceSlug, setServiceSlug] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Appointments for current user
  const mine = [...(appointments as any[])]
    .sort((a, b) => +new Date(`${b.date}T${b.time}`) - +new Date(`${a.date}T${a.time}`));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!date || !time) return toast.error("Pick a date and time");
    setSubmitting(true);
    try {
      await submitAppointment({
        clientId: session.id,
        clientName: session.name,
        clientEmail: session.email,
        serviceSlug: serviceSlug || undefined,
        date, time, durationMin: duration,
        notes: notes.trim() || undefined,
      });
      realtime.publish({
        kind: "appointment",
        title: "New appointment request",
        body: `${session.name} — ${new Date(`${date}T${time}`).toLocaleString()}`,
        audience: "admin",
        href: "/admin/appointments",
      });
      toast.success("Request sent — we'll confirm shortly");
      setDate(""); setTime(""); setNotes(""); setServiceSlug("");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Request a call or working session — we'll confirm a slot."
      />

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <form onSubmit={submit} className="surface-card p-6 space-y-4 self-start">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><CalendarPlus size={16} /> New request</h2>
          <div>
            <Label>Service (optional)</Label>
            <Select value={serviceSlug} onValueChange={setServiceSlug}>
              <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
              <SelectContent>
                {(services as any[]).map((s) => <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          </div>
          <div>
            <Label>Duration</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90].map((n) => <SelectItem key={n} value={String(n)}>{n} minutes</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What would you like to discuss?" />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : "Request appointment"}
          </Button>
        </form>

        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Your appointments</h2>
          {mine.length === 0 ? (
            <EmptyState title="Nothing scheduled" description="Submit a request to get on the calendar." />
          ) : mine.map((a: any) => (
            <div key={a.id} className="surface-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{a.status}</div>
                <div className="font-display font-semibold mt-1">{new Date(`${a.date}T${a.time}`).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{a.durationMin} min{a.notes ? ` · ${a.notes}` : ""}</div>
              </div>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                a.status === "confirmed" ? "bg-emerald-500 text-white"
                : a.status === "declined" ? "bg-destructive text-destructive-foreground"
                : a.status === "completed" ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-foreground"}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PortalAppointments;
