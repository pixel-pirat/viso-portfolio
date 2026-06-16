import { useState } from "react";
import { Lock, UserPlus, KeyRound } from "lucide-react";
import { useAdminAuth } from "@/admin/AdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const PortalLogin = () => {
  const { login, signup } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPw, setSPw] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await login(email, password);
    if (r.ok === false) toast({ title: "Sign-in failed", description: (r as any).error, variant: "destructive" });
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await signup({ name: sName, email: sEmail, password: sPw, role: "client" });
    if (r.ok === false) toast({ title: "Signup failed", description: (r as any).error, variant: "destructive" });
    else toast({ title: "Welcome", description: "Your client account is ready." });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm surface-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Client portal</h1>
            <p className="text-xs text-muted-foreground">Track your projects, proposals, and invoices.</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login"><KeyRound size={12} className="mr-1" /> Login</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus size={12} className="mr-1" /> Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-3">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <Button type="submit" variant="hero" className="w-full">Sign in</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={onSignup} className="space-y-3">
              <div><Label>Name</Label><Input value={sName} onChange={(e) => setSName(e.target.value)} required /></div>
              <div><Label>Email</Label><Input type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} required /></div>
              <div><Label>Password</Label><Input type="password" value={sPw} onChange={(e) => setSPw(e.target.value)} required minLength={6} /></div>
              <Button type="submit" variant="hero" className="w-full">Create account</Button>
              <p className="text-[11px] text-muted-foreground">Stored in this browser only — frontend mock.</p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortalLogin;
