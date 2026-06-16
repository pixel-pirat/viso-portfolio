import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin } from "../middleware/auth";

const router = Router();

async function buildProject(row: Record<string, unknown>) {
  const [tools, results, gallery] = await Promise.all([
    query<{ name: string }>(`SELECT name FROM project_tools WHERE project_id=$1 ORDER BY position`, [row.id]),
    query<{ metric: string; label: string }>(`SELECT metric, label FROM project_results WHERE project_id=$1 ORDER BY position`, [row.id]),
    query<{ id: string; url: string; alt: string; kind: string; caption: string }>(
      `SELECT id, url, alt, kind, caption FROM project_media WHERE project_id=$1 ORDER BY position`,
      [row.id]
    ),
  ]);

  return {
    ...row,
    tools: tools.map((t) => t.name),
    results,
    gallery,
  };
}

// GET /api/projects
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, featured } = req.query;
    let sql = `SELECT id, slug, title, category, excerpt, problem, solution, cover_image, is_featured, is_published, published_at FROM projects WHERE is_published=true`;
    const params: unknown[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category=$${params.length}`;
    }
    if (featured === "true") {
      sql += ` AND is_featured=true`;
    }
    sql += ` ORDER BY published_at DESC`;

    const rows = await query(sql, params);
    const projects = await Promise.all(rows.map(buildProject));
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/all (admin)
router.get("/all", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, slug, title, category, excerpt, problem, solution, cover_image, is_featured, is_published, published_at FROM projects ORDER BY published_at DESC`
    );
    const projects = await Promise.all(rows.map(buildProject));
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:slug
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, slug, title, category, excerpt, problem, solution, cover_image, is_featured, is_published, published_at FROM projects WHERE slug=$1`,
      [req.params.slug]
    );
    if (!row) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const project = await buildProject(row);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects (admin)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, title, category, excerpt, problem, solution, cover_image, is_featured = false, published_at, tools = [], results = [], gallery = [] } = req.body;
    const { pool } = await import("../db/pool");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const r = await client.query(
        `INSERT INTO projects (slug, title, category, excerpt, problem, solution, cover_image, is_featured, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [slug, title, category, excerpt, problem, solution, cover_image, is_featured, published_at || new Date()]
      );
      const pid = r.rows[0].id;
      for (let i = 0; i < tools.length; i++) {
        await client.query(`INSERT INTO project_tools (project_id, name, position) VALUES ($1,$2,$3)`, [pid, tools[i], i]);
      }
      for (let i = 0; i < results.length; i++) {
        await client.query(`INSERT INTO project_results (project_id, metric, label, position) VALUES ($1,$2,$3,$4)`, [pid, results[i].metric, results[i].label, i]);
      }
      for (let i = 0; i < gallery.length; i++) {
        const g = gallery[i];
        await client.query(
          `INSERT INTO project_media (project_id, url, alt, kind, caption, position) VALUES ($1,$2,$3,$4,$5,$6)`,
          [pid, g.url, g.alt, g.kind ?? "image", g.caption, i]
        );
      }
      await client.query("COMMIT");
      res.status(201).json({ id: pid });
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

// PATCH /api/projects/:id (admin) — :id can be UUID or slug
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, excerpt, problem, solution, cover_image, is_featured, is_published, published_at, tools, results, gallery } = req.body;
    const resolved = await queryOne<{ id: string }>(
      `SELECT id FROM projects WHERE id=$1 OR slug=$1 LIMIT 1`, [req.params.id]
    );
    if (!resolved) { res.status(404).json({ error: "Project not found" }); return; }
    const pid = resolved.id;
    const { pool } = await import("../db/pool");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE projects SET
         title=COALESCE($1,title), category=COALESCE($2,category), excerpt=COALESCE($3,excerpt),
         problem=COALESCE($4,problem), solution=COALESCE($5,solution), cover_image=COALESCE($6,cover_image),
         is_featured=COALESCE($7,is_featured), is_published=COALESCE($8,is_published),
         published_at=COALESCE($9,published_at)
         WHERE id=$10`,
        [title, category, excerpt, problem, solution, cover_image, is_featured, is_published, published_at, pid]
      );
      if (tools) {
        await client.query(`DELETE FROM project_tools WHERE project_id=$1`, [pid]);
        for (let i = 0; i < tools.length; i++) {
          await client.query(`INSERT INTO project_tools (project_id, name, position) VALUES ($1,$2,$3)`, [pid, tools[i], i]);
        }
      }
      if (results) {
        await client.query(`DELETE FROM project_results WHERE project_id=$1`, [pid]);
        for (let i = 0; i < results.length; i++) {
          await client.query(`INSERT INTO project_results (project_id, metric, label, position) VALUES ($1,$2,$3,$4)`, [pid, results[i].metric, results[i].label, i]);
        }
      }
      if (gallery) {
        await client.query(`DELETE FROM project_media WHERE project_id=$1`, [pid]);
        for (let i = 0; i < gallery.length; i++) {
          const g = gallery[i];
          await client.query(
            `INSERT INTO project_media (project_id, url, alt, kind, caption, position) VALUES ($1,$2,$3,$4,$5,$6)`,
            [pid, g.url, g.alt, g.kind ?? "image", g.caption, i]
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

// DELETE /api/projects/:id (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM projects WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
