import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useStudio, uid } from "@/store/StudioStore";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "./components/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { AdminUser } from "@/store/types";

const ROLES: AdminUser["role"][] = ["admin", "editor", "viewer"];

const UsersAdmin = () => {
  const { state } = useStudio();
  const { saveUser, deleteUser } = useApi();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);

  const newUser = (): AdminUser => ({ id: uid(), name: "", email: "", role: "editor", createdAt: new Date().toISOString() });

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.email.trim()) return toast({ title: "Name & email required", variant: "destructive" });
    const isNew = !state.users.find((u) => u.id === editing.id);
    await saveUser(editing, isNew);
    toast({ title: "User saved" });
    setOpen(false);
  };

  const remove = (id: string) => deleteUser(id);

  return (
    <>
      <PageHeader
        title="Users"
        description="Mock team list for demo. Roles: admin · editor · viewer."
        actions={<Button variant="hero" onClick={() => { setEditing(newUser()); setOpen(true); }}><Plus size={16} /> Invite user</Button>}
      />

      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {state.users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-secondary border border-border text-xs">{u.role}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(u); setOpen(true); }}><Pencil size={13} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive ml-1" onClick={() => remove(u.id)}><Trash2 size={13} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>User</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div>
                <Label>Role</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as AdminUser["role"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersAdmin;
