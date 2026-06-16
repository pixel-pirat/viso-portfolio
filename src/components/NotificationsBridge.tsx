import { useEffect } from "react";
import { useApi } from "@/lib/useApi";
import { useAdminAuth } from "@/admin/AdminAuth";
import { realtime, type RealtimeEvent } from "@/lib/realtime";
import { toast } from "sonner";

/**
 * Single global subscriber. Mounted once near the app root.
 *  - Connects the mock socket on mount.
 *  - Persists every realtime event into the DB via API.
 *  - Shows a sonner toast for events relevant to the current user.
 */
const NotificationsBridge = () => {
  const { createNotification } = useApi();
  const { session } = useAdminAuth();

  useEffect(() => {
    realtime.connect();
    const unsub = realtime.subscribe((e: RealtimeEvent) => {
      // Persist to database via API
      createNotification({
        kind: e.kind,
        title: e.title,
        body: e.body,
        href: e.href,
        audience: e.audience,
      });

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
  }, [createNotification, session?.id, session?.role]);

  return null;
};

export default NotificationsBridge;
