import { Router, Request, Response, NextFunction } from "express";
import { query } from "../db/pool";
import { requireAdmin } from "../middleware/auth";
import { body, validationResult } from "express-validator";

const router = Router();

// POST /api/contact (public)
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("projectDetails").trim().notEmpty().withMessage("Project details are required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }
      const { name, email, company, budgetRange, projectDetails, source } = req.body;
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress;
      const [row] = await query<{ id: string }>(
        `INSERT INTO contact_submissions (name, email, company, budget_range, project_details, source, user_agent, ip_address)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [name, email, company || null, budgetRange || null, projectDetails, source || null, req.headers["user-agent"] || null, ip || null]
      );
      res.status(201).json({ id: row.id, message: "Your message has been received. We'll be in touch soon." });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/contact (admin)
router.get("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let sql = `SELECT id, name, email, company, budget_range, project_details, source, status, created_at FROM contact_submissions`;
    const params: unknown[] = [];
    if (status) { params.push(status); sql += ` WHERE status=$1`; }
    sql += ` ORDER BY created_at DESC`;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/contact/:id (admin)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`UPDATE contact_submissions SET status=$1 WHERE id=$2`, [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
