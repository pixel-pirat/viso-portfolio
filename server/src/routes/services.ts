import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin } from "../middleware/auth";

const router = Router();

async function buildService(row: Record<string, unknown>) {
  const [problems, steps, tiers] = await Promise.all([
    query<{ body: string; position: number }>(
      `SELECT body, position FROM service_problems WHERE service_id=$1 ORDER BY position`,
      [row.id]
    ),
    query<{ step: string; body: string; position: number }>(
      `SELECT step, body, position FROM service_process_steps WHERE service_id=$1 ORDER BY position`,
      [row.id]
    ),
    query<{ tier_key: string; name: string; price: string; description: string; features: string[]; highlighted: boolean; cta_label: string }>(
      `SELECT tier_key as id, name, price, description, features, highlighted, cta_label FROM service_tiers WHERE service_id=$1 ORDER BY position`,
      [row.id]
    ),
  ]);

  return {
    ...row,
    problems: problems.map((p) => p.body),
    process: steps.map((s) => ({ step: s.step, text: s.body })),
    tiers: tiers.map((t) => ({ ...t, features: Array.isArray(t.features) ? t.features : JSON.parse(t.features as unknown as string) })),
  };
}

// GET /api/services
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, slug, title, short, icon, sort_order, is_published
       FROM services WHERE is_published=true ORDER BY sort_order`
    );
    const services = await Promise.all(rows.map(buildService));
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/all (admin — includes unpublished)
router.get("/all", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(`SELECT id, slug, title, short, icon, sort_order, is_published FROM services ORDER BY sort_order`);
    const services = await Promise.all(rows.map(buildService));
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:slug
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, slug, title, short, icon, sort_order, is_published FROM services WHERE slug=$1`,
      [req.params.slug]
    );
    if (!row) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    const service = await buildService(row);
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// POST /api/services (admin)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, title, short, icon, sort_order = 0, problems = [], process: steps = [], tiers = [] } = req.body;
    const { pool } = await import("../db/pool");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res1 = await client.query(
        `INSERT INTO services (slug, title, short, icon, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [slug, title, short, icon, sort_order]
      );
      const id = res1.rows[0].id;
      for (let i = 0; i < problems.length; i++) {
        await client.query(`INSERT INTO service_problems (service_id, body, position) VALUES ($1,$2,$3)`, [id, problems[i], i]);
      }
      for (let i = 0; i < steps.length; i++) {
        await client.query(`INSERT INTO service_process_steps (service_id, step, body, position) VALUES ($1,$2,$3,$4)`, [id, steps[i].step, steps[i].text, i]);
      }
      for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i];
        await client.query(
          `INSERT INTO service_tiers (service_id, tier_key, name, price, description, features, highlighted, cta_label, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, t.id, t.name, t.price, t.description, JSON.stringify(t.features ?? []), t.highlighted ?? false, t.ctaLabel, i]
        );
      }
      await client.query("COMMIT");
      res.status(201).json({ id });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/services/:id (admin) — :id can be UUID or slug
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, short, icon, sort_order, is_published, problems, process: steps, tiers } = req.body;
    // Resolve by slug first, then by UUID cast-safe lookup
    const resolved = await queryOne<{ id: string }>(
      `SELECT id FROM services WHERE slug=$1 LIMIT 1`,
      [req.params.id]
    ) ?? await queryOne<{ id: string }>(
      `SELECT id FROM services WHERE id::text=$1 LIMIT 1`,
      [req.params.id]
    );
    if (!resolved) { res.status(404).json({ error: "Service not found" }); return; }
    const svcId = resolved.id;
    const { pool } = await import("../db/pool");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE services SET title=COALESCE($1,title), short=COALESCE($2,short), icon=COALESCE($3,icon),
         sort_order=COALESCE($4,sort_order), is_published=COALESCE($5,is_published)
         WHERE id=$6`,
        [title, short, icon, sort_order, is_published, svcId]
      );
      if (problems) {
        await client.query(`DELETE FROM service_problems WHERE service_id=$1`, [svcId]);
        for (let i = 0; i < problems.length; i++) {
          await client.query(`INSERT INTO service_problems (service_id, body, position) VALUES ($1,$2,$3)`, [svcId, problems[i], i]);
        }
      }
      if (steps) {
        await client.query(`DELETE FROM service_process_steps WHERE service_id=$1`, [svcId]);
        for (let i = 0; i < steps.length; i++) {
          await client.query(`INSERT INTO service_process_steps (service_id, step, body, position) VALUES ($1,$2,$3,$4)`, [svcId, steps[i].step, steps[i].text, i]);
        }
      }
      if (tiers) {
        await client.query(`DELETE FROM service_tiers WHERE service_id=$1`, [svcId]);
        for (let i = 0; i < tiers.length; i++) {
          const t = tiers[i];
          await client.query(
            `INSERT INTO service_tiers (service_id, tier_key, name, price, description, features, highlighted, cta_label, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [svcId, t.id, t.name, t.price, t.description, JSON.stringify(t.features ?? []), t.highlighted ?? false, t.ctaLabel, i]
          );
        }
      }
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/services/:id (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM services WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
