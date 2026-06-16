import { useEffect, useRef } from "react";
import { useClientProjects } from "@/lib/useData";
import { useApi } from "@/lib/useApi";
import { isOverdue, shouldAutoRemind } from "@/lib/lifecycle";
import { realtime } from "@/lib/realtime";
import { uid } from "@/lib/utils";

/**
 * Mock background scheduler.
 *  - Every 30s, scan client project invoices.
 *  - Mark overdue ones as "overdue" (only if currently "sent").
 *  - For each overdue invoice past cooldown, emit a reminder notification
 *    and append a reminder entry. Real impl would be a server cron.
 */
const RemindersScheduler = () => {
  const { data: clientProjects = [] } = useClientProjects("all");
  const { updateClientProject } = useApi();
  const projectsRef = useRef(clientProjects);
  projectsRef.current = clientProjects;

  useEffect(() => {
    const tick = () => {
      const projects = projectsRef.current as any[];
      const now = Date.now();

      for (const p of projects) {
        let mutated = false;
        const nextInvoices = p.invoices.map((inv: any) => {
          let next = inv;
          if (inv.status === "sent" && isOverdue(inv, now)) {
            next = { ...next, status: "overdue" };
            mutated = true;
          }
          if (shouldAutoRemind(next, now)) {
            const reminder = { id: uid(), sentAt: new Date().toISOString(), channel: "auto" as const };
            next = { ...next, reminders: [...(next.reminders ?? []), reminder] };
            mutated = true;
            realtime.publish({
              kind: "reminder",
              title: `Reminder: ${next.number} unpaid`,
              body: `${p.clientName} — ${next.amount}`,
              audience: "admin",
              href: "/admin/client-projects",
            });
            realtime.publish({
              kind: "reminder",
              title: `Friendly reminder for ${next.number}`,
              body: `Your invoice of ${next.amount} is awaiting payment.`,
              audience: p.clientId,
              href: `/portal/projects/${p.id}`,
            });
          }
          return next;
        });

        if (mutated) {
          updateClientProject(p.id, { ...p, invoices: nextInvoices });
        }
      }
    };

    tick(); // initial pass
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default RemindersScheduler;
