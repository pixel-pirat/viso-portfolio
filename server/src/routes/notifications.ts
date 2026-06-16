import { Router, Request, Response, NextFunction } from "express";
import { query } from "../db/pool";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/notifications (auth — own + admin notifications)
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, kind, title, body, href, audience, is_read AS read, created_at AS "createdAt"
       FROM notifications
       WHERE audience='admin' OR audience=$1
       ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read (auth)
router.patch("/:id/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`UPDATE notifications SET is_read=true WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all (auth)
router.post("/read-all", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(
      `UPDATE notifications SET is_read=true WHERE audience='admin' OR audience=$1`,
      [req.user!.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications (auth — broadcast/create)
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kind, title, body, href, audience = "admin" } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO notifications (kind, title, body, href, audience) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [kind, title, body, href || null, audience]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

export default router;
