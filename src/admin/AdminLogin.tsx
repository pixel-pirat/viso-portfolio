import { useState } from "react";
import { Lock, UserPlus, KeyRound } from "lucide-react";
import { useAdminAuth } from "./AdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const { login, legacyLogin, signup } = useAdminAuth();

  // Legacy quick gate
  const [pw, setPw] = useState("");

  // Email/password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup
  const [sName, setSName] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPw, setSPw] = useState("");

  const onLegacy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legacyLogin(pw)) {
      toast({ title: "Wrong password", description: "Try again.", variant: "destructive" });
    }
  };

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (!r.ok) toast({ title: "Sign-in failed", description: (r as { error: string }).error, variant: "destructive" });
  };

  const onSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // First account becomes admin so the user can actually manage things
    const r = signup({ name: sName, email: sEmail, password: sPw, role: "admin" });
    if (!r.ok) toast({ title: "Signup failed", description: (r as { error: string }).error, variant: "destructive" });
    else toast({ title: "Account created", description: "You're signed in as admin." });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm surface-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Lock size={18} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">Admin access</h1>
            <p className="text-xs text-muted-foreground">Demo gate — frontend mock auth.</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login"><KeyRound size={12} className="mr-1" /> Login</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus size={12} className="mr-1" /> Sign up</TabsTrigger>
            <TabsTrigger value="quick">Quick</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="le">Email</Label>
                <Input id="le" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lp">Password</Label>
                <Input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" variant="hero" className="w-full">Sign in</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={onSignup} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="sn">Name</Label>
                <Input id="sn" value={sName} onChange={(e) => setSName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="se">Email</Label>
                <Input id="se" type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sp">Password</Label>
                <Input id="sp" type="password" value={sPw} onChange={(e) => setSPw(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" variant="hero" className="w-full">Create admin account</Button>
              <p className="text-[11px] text-muted-foreground">Stored in this browser only.</p>
            </form>
          </TabsContent>

          <TabsContent value="quick">
            <form onSubmit={onLegacy} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="pw">Master password</Label>
                <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required />
                <p className="text-[11px] text-muted-foreground">Hint: <code>studio2026</code></p>
              </div>
              <Button type="submit" variant="outline" className="w-full">Enter admin</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminLogin;
