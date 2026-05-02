import { useEffect } from "react";
import { useStudio, uid } from "@/store/StudioStore";
import { useAdminAuth } from "@/admin/AdminAuth";
import { realtime, type RealtimeEvent } from "@/lib/realtime";
import type { NotificationItem } from "@/store/types";
import { toast } from "sonner";

/**
 * Single global subscriber. Mounted once near the app root.
 *  - Connects the mock socket on mount.
 *  - Persists every realtime event into `state.notifications`.
 *  - Shows a sonner toast for events relevant to the current user.
 */
const NotificationsBridge = () => {
  const { setState } = useStudio();
  const { session } = useAdminAuth();

  useEffect(() => {
    realtime.connect();
    const unsub = realtime.subscribe((e: RealtimeEvent) => {
      const item: NotificationItem = {
        id: uid(),
        kind: e.kind,
        title: e.title,
        body: e.body,
        href: e.href,
        audience: e.audience,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setState((s) => ({
        ...s,
        notifications: [item, ...s.notifications].slice(0, 200),
      }));

      // Show toast only to the addressed audience.
      const isAdminViewer = session?.role === "admin";
      const isClientViewer = session?.role === "client";
      const targeted =
        (e.audience === "admin" && isAdminViewer) ||
        (isClientViewer && session?.id === e.audience);

      if (targeted) {
        toast(e.title, { description: e.body });
      }
    });

    return () => {
      unsub();
      realtime.disconnect();
    };
  }, [setState, session?.id, session?.role]);

  return null;
};

export default NotificationsBridge;
