import { useState } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Service, ServiceTier } from "@/store/types";

type Props = {
  service: Service;
  tier: ServiceTier;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const BookingDialog = ({ service, tier, open, onOpenChange }: Props) => {
  const { setState } = useStudio();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setState((s) => ({
        ...s,
        bookings: [
          {
            id: uid(),
            name, email, message,
            serviceSlug: service.slug,
            tierId: tier.id,
            status: "new",
            createdAt: new Date().toISOString(),
          },
          ...s.bookings,
        ],
      }));
      toast({ title: "Booking received", description: `We'll reply about your ${tier.name} package within 1 business day.` });
      setSubmitting(false);
      setName(""); setEmail(""); setMessage("");
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {tier.name} — {tier.price}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-lg bg-secondary border border-border p-3 text-sm">
            <div className="font-medium">{service.title}</div>
            <div className="text-muted-foreground">{tier.description}</div>
          </div>
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><Label>Project details</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={submitting}>{submitting ? "Sending..." : "Confirm booking"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
