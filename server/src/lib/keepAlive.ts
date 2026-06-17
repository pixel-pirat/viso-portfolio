/**
 * Pings the server's own health endpoint every 14 minutes
 * to prevent Render free tier from spinning down.
 */
export function startKeepAlive(serverUrl: string) {
  const interval = 14 * 60 * 1000; // 14 minutes

  const ping = async () => {
    try {
      const res = await fetch(`${serverUrl}/health`);
      if (res.ok) {
        console.log(`[keep-alive] ping OK — ${new Date().toISOString()}`);
      }
    } catch (err) {
      console.warn("[keep-alive] ping failed:", err);
    }
  };

  setInterval(ping, interval);
  console.log(`[keep-alive] started — pinging ${serverUrl} every 14 min`);
}
