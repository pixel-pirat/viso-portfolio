import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/proposals (admin — all)
router.get("/", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, booking_id, client_id, client_name, client_email, service_slug, tier_id,
       title, summary, scope, price, timeline_weeks, status, created_at, decided_at
       FROM proposals ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/proposals/mine (client — own proposals)
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, client_id, client_name, service_slug, tier_id, title, summary, scope, price, timeline_weeks, status, created_at, decided_at
       FROM proposals WHERE client_id=$1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/proposals/:id
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, booking_id, client_id, client_name, client_email, service_slug, tier_id,
       title, summary, scope, price, timeline_weeks, status, created_at, decided_at
       FROM proposals WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "Proposal not found" });
      return;
    }
    // clients can only see their own
    if (req.user!.role === "client" && (row as { client_id: string }).client_id !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// POST /api/proposals (admin)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { booking_id, client_id, client_name, client_email, service_slug, tier_id, title, summary, scope = [], price, timeline_weeks = 4, status = "draft" } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO proposals (booking_id, client_id, client_name, client_email, service_slug, tier_id, title, summary, scope, price, timeline_weeks, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [booking_id || null, client_id, client_name, client_email, service_slug, tier_id, title, summary, JSON.stringify(scope), price, timeline_weeks, status]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/proposals/:id (admin or client decision)
router.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne<{ client_id: string; status: string }>(
      `SELECT client_id, status FROM proposals WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "Proposal not found" });
      return;
    }

    const isAdmin = ["admin", "editor"].includes(req.user!.role);
    const isOwner = row.client_id === req.user!.id;

    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Clients can only accept/decline
    if (!isAdmin && !["accepted", "declined"].includes(req.body.status)) {
      res.status(403).json({ error: "Clients can only accept or decline proposals" });
      return;
    }

    const { status, title, summary, scope, price, timeline_weeks } = req.body;
    await query(
      `UPDATE proposals SET
       status=COALESCE($1,status), title=COALESCE($2,title), summary=COALESCE($3,summary),
       scope=COALESCE($4,scope), price=COALESCE($5,price), timeline_weeks=COALESCE($6,timeline_weeks),
       decided_at=CASE WHEN $1 IN ('accepted','declined') THEN NOW() ELSE decided_at END
       WHERE id=$7`,
      [status, title, summary, scope ? JSON.stringify(scope) : null, price, timeline_weeks, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
