import { useState } from "react";
import { Lock } from "lucide-react";
import { useAdminAuth } from "./AdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const ok = login(pw);
      setSubmitting(false);
      if (!ok) toast({ title: "Wrong password", description: "Try again.", variant: "destructive" });
    }, 250);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm surface-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Admin access</h1>
            <p className="text-xs text-muted-foreground">Demo gate — password protected.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required />
          <p className="text-[11px] text-muted-foreground">Hint: <code>studio2026</code></p>
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
          {submitting ? "Checking..." : "Enter admin"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
