import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, EyeOff, Eye, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudio } from "@/store/StudioStore";
import { useApi } from "@/lib/useApi";
import { stageLabel, visibilityLabel } from "@/lib/collab";
import { toast } from "@/hooks/use-toast";

const CollaborationsAdmin = () => {
  const { state } = useStudio();
  const { updateCollabStatus, resolveReport: apiResolveReport } = useApi();
  const [filter, setFilter] = useState<"all" | "active" | "flagged" | "removed">("all");

  const collabs = useMemo(() => {
    const flagged = new Set(state.collaborationReports.filter((r) => r.status === "open").map((r) => r.collaborationId));
    return state.collaborations.map((c) => ({ ...c, hasReport: flagged.has(c.id) }))
      .filter((c) => filter === "all" ? true : filter === "flagged" ? c.hasReport : c.status === filter);
  }, [state.collaborations, state.collaborationReports, filter]);

  const reports = state.collaborationReports;

  const setStatus = (id: string, status: "active" | "flagged" | "removed") => {
    updateCollabStatus(id, status);
    toast({ title: `Collaboration ${status}` });
  };

  const resolveReport = (id: string, status: "reviewed" | "dismissed") => {
    apiResolveReport(id, status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Collaborations</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate ideas, review abuse reports, and manage visibility disputes.</p>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects ({state.collaborations.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.filter((r) => r.status === "open").length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({state.collaborationRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex items-center justify-end">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="flagged">Has open reports</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {collabs.length === 0 ? (
            <div className="surface-card p-10 text-center text-sm text-muted-foreground">No collaborations.</div>
          ) : collabs.map((c) => (
            <div key={c.id} className="surface-card p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Badge variant="secondary" className="rounded-full">{c.category}</Badge>
                  <span>{stageLabel(c.stage)}</span>
                  <span>· {visibilityLabel(c.visibility)}</span>
                  {c.hasReport && <Badge variant="destructive" className="rounded-full"><ShieldAlert size={10} className="mr-1" /> Reported</Badge>}
                  {c.status !== "active" && <Badge variant="outline" className="rounded-full capitalize">{c.status}</Badge>}
                </div>
                <Link to={`/collaborations/${c.id}`} className="font-display font-bold hover:underline">{c.title}</Link>
                <p className="text-xs text-muted-foreground">By {c.ownerName} · {c.ownerEmail}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {c.status !== "removed" ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(c.id, "flagged")}><Flag size={14} /> Flag</Button>
                ) : null}
                {c.status === "active" ? (
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "removed")}><EyeOff size={14} /> Hide</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "active")}><Eye size={14} /> Restore</Button>
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-3 mt-4">
          {reports.length === 0 ? (
            <div className="surface-card p-10 text-center text-sm text-muted-foreground">No reports yet.</div>
          ) : reports.map((r) => {
            const c = state.collaborations.find((x) => x.id === r.collaborationId);
            return (
              <div key={r.id} className="surface-card p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c?.title} · reported by {r.reporterName}</div>
                    <div className="font-medium capitalize">{r.reason.replace("_", " ")}</div>
                  </div>
                  <Badge variant={r.status === "open" ? "destructive" : "outline"} className="capitalize">{r.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.details || "No additional details."}</p>
                {r.status === "open" && (
                  <div className="flex gap-2 mt-3 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => resolveReport(r.id, "dismissed")}>Dismiss</Button>
                    <Button size="sm" variant="destructive" onClick={() => { resolveReport(r.id, "reviewed"); if (c) setStatus(c.id, "removed"); }}>
                      <Trash2 size={14} /> Remove project
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="requests" className="space-y-3 mt-4">
          {state.collaborationRequests.length === 0 ? (
            <div className="surface-card p-10 text-center text-sm text-muted-foreground">No collaboration requests yet.</div>
          ) : state.collaborationRequests.map((r) => {
            const c = state.collaborations.find((x) => x.id === r.collaborationId);
            return (
              <div key={r.id} className="surface-card p-4 text-sm">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{c?.title} · {r.kind}{r.role ? ` · ${r.role}` : ""}</div>
                    <div className="font-medium">{r.userName} <span className="text-muted-foreground text-xs">({r.userEmail})</span></div>
                  </div>
                  <Badge variant={r.status === "accepted" ? "default" : r.status === "declined" ? "outline" : "secondary"} className="capitalize">{r.status}</Badge>
                </div>
                <p className="text-muted-foreground">{r.message}</p>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborationsAdmin;
