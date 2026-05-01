import { useEffect, useState } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { useAdminAuth } from "./AdminAuth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Booking, Proposal } from "@/store/types";
import { buildProposalFromTier } from "@/lib/lifecycle";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking?: Booking;            // when converting a booking
  initial?: Partial<Proposal>;  // for edit
};

const CreateProposalDialog = ({ open, onOpenChange, booking, initial }: Props) => {
  const { state, setState } = useStudio();
  const { accounts } = useAdminAuth();

  const clients = accounts.filter((a) => a.role === "client");

  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [serviceSlug, setServiceSlug] = useState(state.services[0]?.slug ?? "");
  const [tierId, setTierId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [scopeText, setScopeText] = useState("");
  const [price, setPrice] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState(6);

  const service = state.services.find((s) => s.slug === serviceSlug);
  const tier = service?.tiers.find((t) => t.id === tierId);

  // Reset / hydrate when opened
  useEffect(() => {
    if (!open) return;
    if (booking) {
      setClientId(booking.clientId ?? "");
      setClientName(booking.name);
      setClientEmail(booking.email);
      setServiceSlug(booking.serviceSlug);
      setTierId(booking.tierId);
    } else if (initial) {
      setClientId(initial.clientId ?? "");
      setClientName(initial.clientName ?? "");
      setClientEmail(initial.clientEmail ?? "");
      setServiceSlug(initial.serviceSlug ?? state.services[0]?.slug ?? "");
      setTierId(initial.tierId ?? "");
      setTitle(initial.title ?? "");
      setSummary(initial.summary ?? "");
      setScopeText((initial.scope ?? []).join("\n"));
      setPrice(initial.price ?? "");
      setTimelineWeeks(initial.timelineWeeks ?? 6);
    }
  }, [open, booking, initial, state.services]);

  // Auto-fill title/summary/scope/price from selected tier
  useEffect(() => {
    if (!service || !tier) return;
    const t = buildProposalFromTier(service, tier);
    setTitle((cur) => cur || t.title);
    setSummary((cur) => cur || t.summary);
    setScopeText((cur) => cur || t.scope.join("\n"));
    setPrice((cur) => cur || t.price);
  }, [service, tier]);

  const submit = (e: React.FormEvent, sendNow: boolean) => {
    e.preventDefault();
    if (!service || !tier) return toast({ title: "Pick a service and tier", variant: "destructive" });
    if (!clientName || !clientEmail) return toast({ title: "Client name and email required", variant: "destructive" });

    const proposal: Proposal = {
      id: uid(),
      bookingId: booking?.id,
      clientId: clientId || `guest:${clientEmail.toLowerCase()}`,
      clientName,
      clientEmail,
      serviceSlug,
      tierId,
      title,
      summary,
      scope: scopeText.split("\n").map((s) => s.trim()).filter(Boolean),
      price,
      timelineWeeks,
      status: sendNow ? "sent" : "draft",
      createdAt: new Date().toISOString(),
    };

    setState((s) => ({
      ...s,
      proposals: [proposal, ...s.proposals],
      bookings: booking
        ? s.bookings.map((b) => b.id === booking.id ? { ...b, status: "replied" } : b)
        : s.bookings,
    }));

    toast({ title: sendNow ? "Proposal sent" : "Proposal saved as draft" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? `New proposal for ${booking.name}` : "New proposal"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={(e) => submit(e, true)}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Client name</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </div>
            <div>
              <Label>Client email</Label>
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
            </div>
          </div>

          {clients.length > 0 && (
            <div>
              <Label>Link to client account (optional)</Label>
              <Select value={clientId || "none"} onValueChange={(v) => {
                if (v === "none") return setClientId("");
                setClientId(v);
                const acct = clients.find((c) => c.id === v);
                if (acct) { setClientName(acct.name); setClientEmail(acct.email); }
              }}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} — {c.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Service</Label>
              <Select value={serviceSlug} onValueChange={(v) => { setServiceSlug(v); setTierId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {state.services.map((s) => <SelectItem key={s.slug} value={s.slug}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={tierId} onValueChange={setTierId}>
                <SelectTrigger><SelectValue placeholder="Pick tier" /></SelectTrigger>
                <SelectContent>
                  {service?.tiers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} — {t.price}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div>
            <Label>Scope (one per line)</Label>
            <Textarea rows={5} value={scopeText} onChange={(e) => setScopeText(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$6,500" required />
            </div>
            <div>
              <Label>Timeline (weeks)</Label>
              <Input type="number" min={1} value={timelineWeeks} onChange={(e) => setTimelineWeeks(Number(e.target.value))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={(e) => submit(e, false)}>Save draft</Button>
            <Button type="submit" variant="hero">Send to client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProposalDialog;
