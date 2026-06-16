import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/admin/AdminAuth";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Paperclip, X } from "lucide-react";
import type { Attachment, Service, ServiceTier } from "@/store/types";
import { fileToAttachment, formatBytes, MAX_TOTAL_BYTES, totalSize } from "@/lib/uploads";

type Props = {
  service: Service;
  tier: ServiceTier;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const BookingDialog = ({ service, tier, open, onOpenChange }: Props) => {
  const { submitBooking } = useApi();
  const { session } = useAdminAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Prefill from logged-in client account
  useEffect(() => {
    if (open && session?.role === "client") {
      setName((n) => n || session.name);
      setEmail((e) => e || session.email);
    }
  }, [open, session]);

  const reset = () => {
    setName(""); setEmail(""); setMessage(""); setAttachments([]);
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: Attachment[] = [...attachments];
    for (const file of Array.from(files)) {
      try {
        const att = await fileToAttachment(file);
        if (totalSize(next) + att.size > MAX_TOTAL_BYTES) {
          toast({ title: "Too many files", description: `Total exceeds ${formatBytes(MAX_TOTAL_BYTES)}.`, variant: "destructive" });
          break;
        }
        next.push(att);
      } catch (e) {
        toast({ title: "Skipped a file", description: (e as Error).message, variant: "destructive" });
      }
    }
    setAttachments(next);
  };

  const removeAttachment = (id: string) =>
    setAttachments((a) => a.filter((x) => x.id !== id));

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
            attachments,
            clientId: session?.role === "client" ? session.id : undefined,
          },
          ...s.bookings,
        ],
      }));
      toast({ title: "Booking received", description: `We'll reply about your ${tier.name} package within 1 business day.` });
      setSubmitting(false);
      reset();
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-2">
            <Label>Attachments <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { onPickFiles(e.target.files); e.target.value = ""; }}
            />
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Paperclip size={14} /> Attach files
            </Button>

            {attachments.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {attachments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-sm rounded-md border border-border bg-background px-2.5 py-1.5">
                    <span className="truncate">{a.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{formatBytes(a.size)}</span>
                      <button type="button" onClick={() => removeAttachment(a.id)} aria-label="Remove" className="text-muted-foreground hover:text-destructive">
                        <X size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-muted-foreground">
              Briefs, references, screenshots — up to {formatBytes(MAX_TOTAL_BYTES)} total.
            </p>
          </div>

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
