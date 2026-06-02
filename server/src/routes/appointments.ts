import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { body, validationResult } from "express-validator";

const router = Router();

// POST /api/appointments (auth or public)
router.post(
  "/",
  [
    body("clientName").trim().notEmpty().withMessage("Name is required"),
    body("clientEmail").isEmail().withMessage("Valid email required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
      const { clientName, clientEmail, serviceSlug, date, time, durationMin = 60, notes, clientId } = req.body;
      const [row] = await query<{ id: string }>(
        `INSERT INTO appointments (client_id, client_name, client_email, service_slug, date, time, duration_min, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [clientId || null, clientName, clientEmail, serviceSlug || null, date, time, durationMin, notes || null]
      );
      res.status(201).json({ id: row.id });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/appointments (admin)
router.get("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, date } = req.query;
    let sql = `SELECT id, client_id, client_name, client_email, service_slug, date, time, duration_min, notes, status, created_at FROM appointments`;
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) { params.push(status); conditions.push(`status=$${params.length}`); }
    if (date) { params.push(date); conditions.push(`date=$${params.length}`); }
    if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
    sql += ` ORDER BY date, time`;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/mine (client)
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, client_name, client_email, service_slug, date, time, duration_min, notes, status, created_at FROM appointments WHERE client_id=$1 ORDER BY date DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/appointments/:id (admin)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, date, time, duration_min, notes } = req.body;
    await query(
      `UPDATE appointments SET status=COALESCE($1,status), date=COALESCE($2,date), time=COALESCE($3,time),
       duration_min=COALESCE($4,duration_min), notes=COALESCE($5,notes) WHERE id=$6`,
      [status, date, time, duration_min, notes, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM appointments WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
