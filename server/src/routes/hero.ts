import { Router, Request, Response, NextFunction } from "express";
import { query } from "../db/pool";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/hero
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [slides, activity] = await Promise.all([
      query(`SELECT id, eyebrow, title, subtitle, cta_label, cta_href, sort_order FROM hero_slides ORDER BY sort_order`),
      query(`SELECT id, kind, text, created_at FROM activity_items ORDER BY created_at DESC LIMIT 10`),
    ]);
    res.json({ slides, activity });
  } catch (err) {
    next(err);
  }
});

// POST /api/hero/slides (admin)
router.post("/slides", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eyebrow, title, subtitle, cta_label, cta_href, sort_order = 0 } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO hero_slides (eyebrow, title, subtitle, cta_label, cta_href, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [eyebrow, title, subtitle, cta_label, cta_href, sort_order]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/hero/slides/:id (admin)
router.patch("/slides/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eyebrow, title, subtitle, cta_label, cta_href, sort_order } = req.body;
    await query(
      `UPDATE hero_slides SET eyebrow=COALESCE($1,eyebrow), title=COALESCE($2,title), subtitle=COALESCE($3,subtitle),
       cta_label=COALESCE($4,cta_label), cta_href=COALESCE($5,cta_href), sort_order=COALESCE($6,sort_order)
       WHERE id=$7`,
      [eyebrow, title, subtitle, cta_label, cta_href, sort_order, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hero/slides/:id (admin)
router.delete("/slides/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM hero_slides WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/hero/activity (admin)
router.post("/activity", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kind, text } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO activity_items (kind, text) VALUES ($1,$2) RETURNING id`,
      [kind, text]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

export default router;
