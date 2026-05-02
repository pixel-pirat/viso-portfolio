import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, MessageSquare, FileText, Receipt, FolderKanban, Calendar, AlarmClock, Trash2 } from "lucide-react";
import { useStudio } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationKind } from "@/store/types";

const ICONS: Record<NotificationKind, typeof Bell> = {
  message: MessageSquare,
  proposal: FileText,
  invoice: Receipt,
  project_update: FolderKanban,
  appointment: Calendar,
  reminder: AlarmClock,
};

const NotificationBell = ({ className }: { className?: string }) => {
  const { state, setState } = useStudio();
  const { session } = useAdminAuth();
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => {
    return state.notifications.filter((n) => {
      if (!session) return false;
      if (session.role === "admin") return n.audience === "admin";
      return n.audience === session.id;
    });
  }, [state.notifications, session]);

  const unread = visible.filter((n) => !n.read).length;

  const markAllRead = () =>
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        visible.some((v) => v.id === n.id) ? { ...n, read: true } : n,
      ),
    }));

  const markRead = (id: string) =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));

  const clearAll = () =>
    setState((s) => ({ ...s, notifications: s.notifications.filter((n) => !visible.some((v) => v.id === n.id)) }));

  if (!session) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications (${unread} unread)`}
          className={cn(
            "relative inline-grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary/60 text-foreground hover:bg-secondary transition-colors",
            className,
          )}
        >
          <Bell size={15} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid place-items-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 bg-popover border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <div className="font-display font-semibold text-sm">Notifications</div>
            <div className="text-[11px] text-muted-foreground">{unread} unread · {visible.length} total</div>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={markAllRead} disabled={unread === 0}>
              <CheckCheck size={13} /> Read
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={clearAll} disabled={visible.length === 0}>
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {visible.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visible.map((n) => <Row key={n.id} n={n} onClick={() => { markRead(n.id); setOpen(false); }} />)}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Row = ({ n, onClick }: { n: NotificationItem; onClick: () => void }) => {
  const Icon = ICONS[n.kind] ?? Bell;
  const ago = timeAgo(n.createdAt);
  const body = (
    <div className="flex gap-3 px-4 py-3 text-left w-full hover:bg-secondary/60 transition-colors">
      <span className={cn(
        "grid h-8 w-8 place-items-center rounded-md shrink-0 border border-border",
        n.read ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground",
      )}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm leading-snug", !n.read && "font-semibold")}>{n.title}</div>
        {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">{ago}</div>
      </div>
      {!n.read && <span className="h-2 w-2 rounded-full bg-primary self-start mt-2 shrink-0" aria-label="unread" />}
    </div>
  );

  if (n.href) {
    return (
      <li>
        <Link to={n.href} onClick={onClick}>{body}</Link>
      </li>
    );
  }
  return <li><button className="w-full" onClick={onClick}>{body}</button></li>;
};

function timeAgo(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default NotificationBell;
