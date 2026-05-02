/**
 * Mock real-time event bus.
 *
 * Designed as a drop-in replacement target for a real WebSocket layer:
 *  - `connect()` / `disconnect()` mirror a socket lifecycle.
 *  - `publish(event)` simulates a server broadcast (here: same-tab dispatch).
 *  - `subscribe(handler)` mirrors `socket.on("message", ...)`.
 *
 * To swap to a real backend, replace the EventTarget with a WebSocket and
 * keep the same exported surface.
 */

import type { NotificationKind } from "@/store/types";

export type RealtimeEvent = {
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  /** Account id of recipient or "admin". */
  audience: "admin" | string;
  /** Optional metadata for handlers (project ids, etc). */
  meta?: Record<string, unknown>;
};

type Handler = (e: RealtimeEvent) => void;

const target = new EventTarget();
const EVENT_NAME = "studio:rt";
let connected = false;

export const realtime = {
  connect() {
    connected = true;
  },
  disconnect() {
    connected = false;
  },
  isConnected() {
    return connected;
  },
  publish(e: RealtimeEvent) {
    if (!connected) return;
    // Simulate a tiny network hop so UI feels reactive.
    setTimeout(() => target.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: e })), 60);
  },
  subscribe(handler: Handler): () => void {
    const wrapped = (ev: Event) => handler((ev as CustomEvent<RealtimeEvent>).detail);
    target.addEventListener(EVENT_NAME, wrapped);
    return () => target.removeEventListener(EVENT_NAME, wrapped);
  },
};
