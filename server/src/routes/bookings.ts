import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { body, validationResult } from "express-validator";

const router = Router();

// POST /api/bookings (public — anyone can submit)
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("serviceSlug").notEmpty().withMessage("Service is required"),
    body("tierId").notEmpty().withMessage("Tier is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
      const { name, email, serviceSlug, tierId, message, clientId } = req.body;
      const [row] = await query<{ id: string }>(
        `INSERT INTO bookings (name, email, service_slug, tier_id, message, client_id)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [name, email, serviceSlug, tierId, message, clientId || null]
      );
      res.status(201).json({ id: row.id });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookings (admin)
router.get("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let sql = `SELECT id, name, email, service_slug, tier_id, message, status, client_id, attachments, created_at FROM bookings`;
    const params: unknown[] = [];
    if (status) {
      params.push(status);
      sql += ` WHERE status=$${params.length}`;
    }
    sql += ` ORDER BY created_at DESC`;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id (admin)
router.get("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, name, email, service_slug, tier_id, message, status, client_id, attachments, created_at FROM bookings WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id (admin — update status)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    await query(`UPDATE bookings SET status=$1 WHERE id=$2`, [status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/mine (client — own bookings)
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, name, email, service_slug, tier_id, message, status, created_at FROM bookings WHERE client_id=$1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
