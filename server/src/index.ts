import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import authRouter from "./routes/auth";
import servicesRouter from "./routes/services";
import projectsRouter from "./routes/projects";
import blogRouter from "./routes/blog";
import bookingsRouter from "./routes/bookings";
import proposalsRouter from "./routes/proposals";
import clientProjectsRouter from "./routes/clientProjects";
import appointmentsRouter from "./routes/appointments";
import collaborationsRouter from "./routes/collaborations";
import notificationsRouter from "./routes/notifications";
import settingsRouter from "./routes/settings";
import heroRouter from "./routes/hero";
import contactRouter from "./routes/contact";
import usersRouter from "./routes/users";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3001;

// ─── Security ───────────────────────────────────────────────
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://viso-teal-kappa.vercel.app")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // tighter for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/services", servicesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/proposals", proposalsRouter);
app.use("/api/client-projects", clientProjectsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/collaborations", collaborationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/hero", heroRouter);
app.use("/api/contact", contactRouter);
app.use("/api/users", usersRouter);

// ─── 404 + Error handlers ────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);

  // Keep Render free tier awake
  if (process.env.NODE_ENV === "production" && process.env.SERVER_URL) {
    const { startKeepAlive } = require("./lib/keepAlive");
    startKeepAlive(process.env.SERVER_URL);
  }
});

export default app;
