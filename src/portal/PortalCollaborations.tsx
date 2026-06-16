import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Inbox, Send, Bookmark, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollaborations } from "@/lib/useData";
import { useAdminAuth } from "@/admin/AdminAuth";
import CollabConsentGate from "@/components/CollabConsentGate";
import CollaborationFormDialog from "@/components/CollaborationFormDialog";
import { hasConsentFromStorage, stageLabel } from "@/lib/collab";
import { useApi } from "@/lib/useApi";
import { toast } from "@/hooks/use-toast";

const Empty = ({ icon: Icon, label }: { icon: typeof Inbox; label: string }) => (
  <div className="surface-card p-10 text-center text-sm text-muted-foreground">
    <Icon className="mx-auto mb-2" /> {label}
  </div>
);

const PortalCollaborations = () => {
  const { data: collaborations = [] } = useCollaborations(undefined, "all");
  const { session } = useAdminAuth();
  const { updateCollabStatus } = useApi();
  const [createOpen, setCreateOpen] = useState(false);

  const accepted = hasConsentFromStorage(session?.id);

  const mine = useMemo(
    () => (collaborations as any[]).filter((c) => c.ownerId === session?.id),
    [collaborations, session?.id],
  );

  // Collaboration requests derived from embedded data
  const allRequests: any[] = useMemo(() => {
    return (collaborations as any[]).flatMap((c) => c.requests ?? []);
  }, [collaborations]);

  const sent = useMemo(
    () => allRequests.filter((r) => r.userId === session?.id),
    [allRequests, session?.id],
  );
  const received = useMemo(() => {
    const myIds = new Set(mine.map((c) => c.id));
    return allRequests.filter((r) => myIds.has(r.collaborationId));
  }, [allRequests, mine]);

  const decide = (id: string, status: "accepted" | "declined") => {
    // TODO: wire to API endpoint when available
    toast({ title: `Request ${status}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Collaborations</h1>
          <p className="text-sm text-muted-foreground mt-1">Your ideas, requests, and the projects you're tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/collaborations">Discover</Link></Button>
          <Button variant="hero" disabled={!accepted} onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New idea
          </Button>
        </div>
      </div>

      {!accepted ? (
        <div className="surface-card p-10 text-center space-y-3">
          <h2 className="font-display text-xl font-bold">Accept the Collaborations agreement to continue</h2>
          <p className="text-sm text-muted-foreground">You'll be able to share ideas and connect with collaborators once you've reviewed the policies.</p>
          <CollabConsentGate />
        </div>
      ) : (
        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine"><Briefcase size={14} className="mr-1.5" /> My collaborations</TabsTrigger>
            <TabsTrigger value="received"><Inbox size={14} className="mr-1.5" /> Requests received</TabsTrigger>
            <TabsTrigger value="sent"><Send size={14} className="mr-1.5" /> Requests sent</TabsTrigger>
            <TabsTrigger value="saved"><Bookmark size={14} className="mr-1.5" /> Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="mt-4">
            {mine.length === 0 ? <Empty icon={Briefcase} label="You haven't shared any collaborations yet." /> : (
              <div className="grid md:grid-cols-2 gap-4">
                {mine.map((c) => (
                  <Link key={c.id} to={`/collaborations/${c.id}`} className="surface-card p-5 hover:border-primary/60">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <Badge variant="secondary" className="rounded-full">{c.category}</Badge>
                      <span>{stageLabel(c.stage)}</span>
                    </div>
                    <h3 className="font-display font-bold">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{c.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-4 space-y-3">
            {received.length === 0 ? <Empty icon={Inbox} label="No incoming requests yet." /> : received.map((r) => {
              const c = (collaborations as any[]).find((x) => x.id === r.collaborationId);
              return (
                <div key={r.id} className="surface-card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c?.title} · {r.kind}{r.role ? ` · ${r.role}` : ""}</div>
                    <div className="font-medium truncate">{r.userName} <span className="text-muted-foreground text-xs">({r.userEmail})</span></div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.message}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {r.status === "pending" ? (
                      <>
                        <Button size="sm" variant="hero" onClick={() => decide(r.id, "accepted")}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => decide(r.id, "declined")}>Decline</Button>
                      </>
                    ) : <Badge variant={r.status === "accepted" ? "default" : "outline"} className="capitalize">{r.status}</Badge>}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-3">
            {sent.length === 0 ? <Empty icon={Send} label="You haven't reached out to any collaborations yet." /> : sent.map((r) => {
              const c = (collaborations as any[]).find((x) => x.id === r.collaborationId);
              return (
                <Link key={r.id} to={`/collaborations/${r.collaborationId}`} className="surface-card p-4 flex items-center justify-between gap-4 hover:border-primary/60">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c?.title} · {r.kind}</div>
                    <p className="text-sm line-clamp-2">{r.message}</p>
                  </div>
                  <Badge variant={r.status === "accepted" ? "default" : r.status === "declined" ? "outline" : "secondary"} className="capitalize">{r.status}</Badge>
                </Link>
              );
            })}
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <Empty icon={Bookmark} label="Save projects from the discovery page (coming soon)." />
          </TabsContent>
        </Tabs>
      )}

      {createOpen && <CollaborationFormDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  );
};

export default PortalCollaborations;
