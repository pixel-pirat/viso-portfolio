import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminAuth } from "@/admin/AdminAuth";
import { useStudio } from "@/store/StudioStore";
import { hasConsent, recordConsent } from "@/lib/collab";
import { ShieldCheck, Lock, Copyright } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Props = {
  /** When true the gate is rendered as a full-page overlay (used as a route guard). */
  fullPage?: boolean;
  onAccepted?: () => void;
  /** Force-open the modal regardless of consent state (used for "Review policies"). */
  forceOpen?: boolean;
  onClose?: () => void;
};

const POLICIES = [
  {
    icon: Lock,
    key: "privacy",
    title: "Privacy Policy",
    body: "Information you publish in Collaborations may be visible to other vetted users based on the visibility level you choose. We never sell your data. You can revoke access and remove your projects at any time.",
  },
  {
    icon: ShieldCheck,
    key: "terms",
    title: "Terms of Agreement",
    body: "Use the platform in good faith. Do not impersonate others, post unlawful content, or make fraudulent funding claims. The studio reserves the right to moderate, suspend, or remove projects that violate these terms.",
  },
  {
    icon: Copyright,
    key: "ip",
    title: "Intellectual Property & Copyright",
    body: "Ownership of every shared idea, concept, or asset remains with its original creator. Unauthorized copying, redistribution, or commercial use of another member's work is strictly prohibited. By participating you agree to respect confidentiality and any NDA acknowledged inside a project.",
  },
];

const CollabConsentGate = ({ fullPage, onAccepted, forceOpen, onClose }: Props) => {
  const { state, setState } = useStudio();
  const { session } = useAdminAuth();
  const navigate = useNavigate();
  const accepted = hasConsent(state, session?.id);
  const [checks, setChecks] = useState<Record<string, boolean>>({ privacy: false, terms: false, ip: false });
  const [confirm, setConfirm] = useState(false);

  const open = forceOpen || (!accepted && !!session);
  const allChecked = checks.privacy && checks.terms && checks.ip && confirm;

  const handleAccept = () => {
    if (!session) return;
    setState((s) => ({ ...s, collabConsents: [...s.collabConsents.filter((c) => c.userId !== session.id), recordConsent(session.id)] }));
    toast({ title: "Welcome to Collaborations", description: "Your consent has been recorded." });
    onClose?.();
    onAccepted?.();
  };

  // Read-only mode for the "review policies" use case
  const reviewOnly = forceOpen && accepted;

  if (fullPage && !session) {
    return (
      <div className="container-studio py-20">
        <div className="max-w-md mx-auto surface-card p-8 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Sign in to access Collaborations</h1>
          <p className="text-sm text-muted-foreground">You need a portal account to share ideas, request collaborators, or express investor interest.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="hero" onClick={() => navigate("/portal")}>Sign in</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Back home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose?.(); if (fullPage && !accepted) navigate("/"); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Collaborations access agreement</DialogTitle>
          <DialogDescription>
            Before joining the Collaborations network, please review and accept the following.
            Your acceptance is timestamped and tied to your account.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-5">
            {POLICIES.map((p) => (
              <section key={p.key} className="rounded-lg border border-border p-4 bg-card">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-foreground shrink-0">
                    <p.icon size={16} />
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </div>
                </div>
                {!reviewOnly && (
                  <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer pl-12">
                    <Checkbox
                      checked={!!checks[p.key]}
                      onCheckedChange={(v) => setChecks((c) => ({ ...c, [p.key]: !!v }))}
                    />
                    I have read and accept the {p.title}
                  </label>
                )}
              </section>
            ))}

            <section className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">By accepting you also confirm that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ideas remain the property of their original creators.</li>
                <li>You will not copy, redistribute, or commercialize others' work without consent.</li>
                <li>You will respect any NDA flag set on a project.</li>
                <li>The platform may moderate, hide, or remove abusive content.</li>
              </ul>
            </section>

            {!reviewOnly && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(!!v)} />
                I understand and agree to the conditions above.
              </label>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          {reviewOnly ? (
            <Button variant="outline" onClick={() => onClose?.()}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { onClose?.(); if (fullPage) navigate("/"); }}>Cancel</Button>
              <Button variant="hero" disabled={!allChecked} onClick={handleAccept}>I Agree & Continue</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CollabConsentGate;
