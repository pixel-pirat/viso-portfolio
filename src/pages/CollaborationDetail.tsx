import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Users, Lock, Sparkles, ShieldCheck, Calendar, Copyright,
  Flag, MessageSquare, Send, AlertTriangle, Pencil, Loader2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CollabConsentGate from "@/components/CollabConsentGate";
import CollaborationFormDialog from "@/components/CollaborationFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminAuth } from "@/admin/AdminAuth";
import { useCollaboration, useCollabMyRequests } from "@/lib/useData";
import { collaborationsApi, notificationsApi } from "@/lib/api";
import {
  ROLES_NEEDED, fundingLabel, hasConsentFromStorage, isVisibleTo,
  stageLabel, visibilityLabel,
} from "@/lib/collab";
import { toast } from "@/hooks/use-toast";

const CollaborationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAdminAuth();

  const { data: rawCollab, isLoading, isError } = useCollaboration(id!);
  const { data: myRequests = [] } = useCollabMyRequests(id!);

  const [ndaAck, setNdaAck] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<"plagiarism" | "abuse" | "spam" | "ip_violation" | "other">("plagiarism");
  const [reportDetails, setReportDetails] = useState("");
  const [interestKind, setInterestKind] = useState<"join" | "interest" | "investor" | "contact">("join");
  const [interestRole, setInterestRole] = useState<typeof ROLES_NEEDED[number]["value"]>("developer");
  const [interestMsg, setInterestMsg] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");

  const collab = useMemo(() => {
    if (!rawCollab) return null;
    return {
      ...rawCollab,
      ownerId: rawCollab.ownerId ?? rawCollab.owner_id,
      ownerName: rawCollab.ownerName ?? rawCollab.owner_name,
      ownerEmail: rawCollab.ownerEmail ?? rawCollab.owner_email,
      skillsNeeded: rawCollab.skillsNeeded ?? rawCollab.skills_needed ?? [],
      rolesNeeded: rawCollab.rolesNeeded ?? rawCollab.roles_needed ?? [],
      fundingStatus: rawCollab.fundingStatus ?? rawCollab.funding_status ?? "n/a",
      fundingGoal: rawCollab.fundingGoal ?? rawCollab.funding_goal,
      teamSize: rawCollab.teamSize ?? rawCollab.team_size ?? 1,
      requiresNda: rawCollab.requiresNda ?? rawCollab.requires_nda ?? false,
      coverImage: rawCollab.coverImage ?? rawCollab.cover_image,
      createdAt: rawCollab.createdAt ?? rawCollab.created_at,
      updatedAt: rawCollab.updatedAt ?? rawCollab.updated_at,
    };
  }, [rawCollab]);

  const accepted = hasConsentFromStorage(session?.id);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-16 container-studio py-20 text-center flex justify-center items-center">
          <Loader2 className="animate-spin text-primary mr-2" /> Loading collaboration...
        </main>
        <Footer />
      </>
    );
  }

  if (!collab || isError) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-16 container-studio py-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Collaboration not found</h1>
          <Button variant="outline" onClick={() => navigate("/collaborations")}>Back to Collaborations</Button>
        </main>
        <Footer />
      </>
    );
  }

  const isOwner = !!session && collab.ownerId === session.id;
  const visible = isVisibleTo(collab, session?.id) || isOwner;
  const ndaGated = collab.requiresNda && !isOwner && !ndaAck;

  const updates = useMemo(() => {
    return ((collab.updates ?? []) as any[]).map((u) => ({
      ...u,
      authorId: u.authorId ?? u.author_id,
      authorName: u.authorName ?? u.author_name,
      authorRole: u.authorRole ?? u.author_role,
      createdAt: u.createdAt ?? u.created_at,
    })).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [collab.updates]);

  const submitInterest = async () => {
    if (!session) return navigate("/portal");
    if (!interestMsg.trim()) {
      toast({ title: "Add a message", description: "Briefly introduce yourself.", variant: "destructive" });
      return;
    }
    try {
      await collaborationsApi.request(collab.id, {
        kind: interestKind,
        role: interestRole,
        message: interestMsg,
      });
      queryClient.invalidateQueries({ queryKey: ["collaborations", collab.id, "my-requests"] });
      
      await notificationsApi.broadcast({
        kind: "message",
        title: `New ${interestKind} request — ${collab.title}`,
        body: `${session.name} reached out.`,
        href: `/collaborations/${collab.id}`,
        audience: collab.ownerId,
      });
      setInterestMsg("");
      toast({ title: "Request sent", description: "The founder will review your request." });
    } catch (err) {
      toast({ title: "Failed to send request", description: (err as Error).message, variant: "destructive" });
    }
  };

  const submitDiscussion = async () => {
    if (!session) return navigate("/portal");
    if (!discussionBody.trim()) return;
    try {
      await collaborationsApi.addUpdate(collab.id, {
        kind: isOwner ? "update" : "discussion",
        body: discussionBody,
        authorRole: isOwner ? "founder" : "visitor",
      });
      queryClient.invalidateQueries({ queryKey: ["collaborations", collab.id] });
      setDiscussionBody("");
    } catch (err) {
      toast({ title: "Failed to post discussion", description: (err as Error).message, variant: "destructive" });
    }
  };

  const submitReport = async () => {
    if (!session) return navigate("/portal");
    try {
      await collaborationsApi.report(collab.id, {
        reason: reportReason,
        details: reportDetails,
      });
      setReportOpen(false);
      setReportDetails("");
      toast({ title: "Report submitted", description: "Our team will review this collaboration." });
    } catch (err) {
      toast({ title: "Failed to submit report", description: (err as Error).message, variant: "destructive" });
    }
  };

  const VIcon = collab.visibility === "public" ? Sparkles : collab.visibility === "invite_only" ? Users : Lock;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="container-studio py-10 max-w-5xl">
          <Link to="/collaborations" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft size={14} /> All collaborations
          </Link>

          {!visible ? (
            <div className="surface-card p-12 mt-6 text-center space-y-3">
              <Lock className="mx-auto" />
              <h1 className="font-display text-2xl font-bold">This collaboration is restricted</h1>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                The owner has limited visibility to invited members or private preview.
                Contact the founder to request access.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-6">
              <div className="space-y-6">
                <header className="surface-card p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Badge variant="secondary" className="rounded-full">{collab.category}</Badge>
                    <span>·</span>
                    <span>{stageLabel(collab.stage)}</span>
                    <span className="inline-flex items-center gap-1"><VIcon size={12} /> {visibilityLabel(collab.visibility)}</span>
                    {collab.requiresNda && <Badge variant="outline" className="rounded-full"><ShieldCheck size={10} className="mr-1" /> NDA</Badge>}
                  </div>
                  <h1 className="font-display text-3xl font-bold tracking-tight">{collab.title}</h1>
                  <p className="text-muted-foreground mt-2">{collab.summary}</p>

                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Copyright size={12} /> © {new Date(collab.createdAt).getFullYear()} {collab.ownerName}
                    </span>
                    <span className="inline-flex items-center gap-1.5"><Calendar size={12} /> Created {new Date(collab.createdAt).toLocaleDateString()}</span>
                    {isOwner && (
                      <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                        <Pencil size={14} /> Edit
                      </Button>
                    )}
                  </div>
                </header>

                {ndaGated && (
                  <div className="surface-card p-6 border-dashed">
                    <h3 className="font-display font-semibold mb-2 inline-flex items-center gap-2"><ShieldCheck size={16} /> NDA acknowledgment required</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      The founder has flagged sensitive details. By acknowledging the NDA you agree to keep all
                      information on this page strictly confidential and to not reproduce it without written consent.
                    </p>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={ndaAck} onCheckedChange={(v) => setNdaAck(!!v)} />
                      I acknowledge the NDA and accept these conditions.
                    </label>
                  </div>
                )}

                {!ndaGated && (
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="discussion">Updates & discussion</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-4">
                      <section className="surface-card p-6 space-y-3">
                        <h2 className="font-display font-semibold">Project description</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{collab.description || "No description yet."}</p>
                      </section>
                      <section className="surface-card p-6 space-y-3">
                        <h2 className="font-display font-semibold">Goals & vision</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{collab.goals || "—"}</p>
                      </section>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <section className="surface-card p-6">
                          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Skills needed</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {collab.skillsNeeded.length ? collab.skillsNeeded.map((s) => (
                              <Badge key={s} variant="outline" className="rounded-full">{s}</Badge>
                            )) : <span className="text-sm text-muted-foreground">—</span>}
                          </div>
                        </section>
                        <section className="surface-card p-6">
                          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Roles needed</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {collab.rolesNeeded.length ? collab.rolesNeeded.map((r) => (
                              <Badge key={r} className="rounded-full capitalize">{r}</Badge>
                            )) : <span className="text-sm text-muted-foreground">—</span>}
                          </div>
                        </section>
                      </div>

                      <section className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground flex items-start gap-3">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Ownership & protection</p>
                          <p>This concept is the intellectual property of {collab.ownerName}. Unauthorized reproduction, redistribution, or use of any content on this page is prohibited and may be reported.</p>
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="discussion" className="space-y-4 mt-4">
                      <div className="surface-card p-4">
                        <Label className="text-xs">{isOwner ? "Post an update" : "Add to discussion"}</Label>
                        <Textarea rows={3} value={discussionBody} onChange={(e) => setDiscussionBody(e.target.value)} placeholder={isOwner ? "Share progress, milestones, or asks…" : "Ask a question or share feedback…"} maxLength={2000} />
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="hero" onClick={submitDiscussion}><Send size={14} /> Post</Button>
                        </div>
                      </div>
                      {updates.length === 0 ? (
                        <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                          <MessageSquare className="mx-auto mb-2" /> No updates yet.
                        </div>
                      ) : updates.map((u) => (
                        <article key={u.id} className="surface-card p-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span className="font-medium text-foreground">{u.authorName} <span className="text-muted-foreground capitalize">· {u.authorRole}</span></span>
                            <span>{new Date(u.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm whitespace-pre-line">{u.body}</p>
                        </article>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
              </div>

              <aside className="space-y-4">
                <div className="surface-card p-5 space-y-3">
                  <h3 className="font-display font-semibold">Founder</h3>
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-sm font-bold text-muted-foreground">
                      {collab.ownerName.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{collab.ownerName}</div>
                      <div className="text-xs text-muted-foreground truncate">{collab.ownerEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="surface-card p-5 space-y-3">
                  <h3 className="font-display font-semibold">Quick facts</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Stage</dt><dd>{stageLabel(collab.stage)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Team size</dt><dd>{collab.teamSize}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Funding</dt><dd>{fundingLabel(collab.fundingStatus)}</dd></div>
                    {collab.fundingGoal && <div className="flex justify-between"><dt className="text-muted-foreground">Goal</dt><dd>{collab.fundingGoal}</dd></div>}
                    <div className="flex justify-between"><dt className="text-muted-foreground">Visibility</dt><dd>{visibilityLabel(collab.visibility)}</dd></div>
                  </dl>
                </div>

                {!ndaGated && !isOwner && accepted && (
                  <div className="surface-card p-5 space-y-3">
                    <h3 className="font-display font-semibold">Express interest</h3>
                    <Select value={interestKind} onValueChange={(v) => setInterestKind(v as typeof interestKind)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="join">Request to join</SelectItem>
                        <SelectItem value="interest">Express interest</SelectItem>
                        <SelectItem value="investor">Investor interest</SelectItem>
                        <SelectItem value="contact">Contact founder</SelectItem>
                      </SelectContent>
                    </Select>
                    {interestKind === "join" && (
                      <Select value={interestRole} onValueChange={(v) => setInterestRole(v as typeof interestRole)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ROLES_NEEDED.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )}
                    <Textarea rows={3} value={interestMsg} onChange={(e) => setInterestMsg(e.target.value)} placeholder="Briefly introduce yourself…" maxLength={1500} />
                    <Button variant="hero" className="w-full" onClick={submitInterest}><Send size={14} /> Send request</Button>
                    {myRequests.length > 0 && (
                      <p className="text-xs text-muted-foreground">You have {myRequests.length} request{myRequests.length === 1 ? "" : "s"} on this project.</p>
                    )}
                  </div>
                )}

                {!isOwner && (
                  <button onClick={() => setReportOpen(true)} className="w-full text-xs text-muted-foreground hover:text-destructive inline-flex items-center justify-center gap-1.5">
                    <Flag size={12} /> Report this collaboration
                  </button>
                )}
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />

      {session && <CollabConsentGate fullPage />}
      {editOpen && <CollaborationFormDialog open={editOpen} onOpenChange={setEditOpen} initial={collab} />}

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report collaboration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Reason</Label>
            <Select value={reportReason} onValueChange={(v) => setReportReason(v as typeof reportReason)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="plagiarism">Plagiarism / idea theft</SelectItem>
                <SelectItem value="ip_violation">IP / copyright violation</SelectItem>
                <SelectItem value="abuse">Abuse or harassment</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Label>Details</Label>
            <Textarea rows={4} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} maxLength={2000} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReport}>Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaborationDetail;
