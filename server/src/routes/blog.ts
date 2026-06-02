import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/blog
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    let sql = `SELECT id, slug, title, excerpt, content, category, read_time, cover_image, is_published, published_at FROM blog_posts WHERE is_published=true`;
    const params: unknown[] = [];
    if (category) {
      params.push(category);
      sql += ` AND category=$${params.length}`;
    }
    sql += ` ORDER BY published_at DESC`;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/blog/all (admin)
router.get("/all", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, slug, title, excerpt, content, category, read_time, cover_image, is_published, published_at FROM blog_posts ORDER BY published_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/blog/:slug
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, slug, title, excerpt, content, category, read_time, cover_image, is_published, published_at FROM blog_posts WHERE slug=$1`,
      [req.params.slug]
    );
    if (!row) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// POST /api/blog (admin)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, title, excerpt, content = [], category = "Design", read_time = "5 min", cover_image, is_published = true, published_at } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO blog_posts (slug, title, excerpt, content, category, read_time, cover_image, is_published, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [slug, title, excerpt, JSON.stringify(content), category, read_time, cover_image, is_published, published_at || new Date()]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/blog/:id (admin)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, excerpt, content, category, read_time, cover_image, is_published, published_at } = req.body;
    await query(
      `UPDATE blog_posts SET
       title=COALESCE($1,title), excerpt=COALESCE($2,excerpt),
       content=COALESCE($3,content), category=COALESCE($4,category),
       read_time=COALESCE($5,read_time), cover_image=COALESCE($6,cover_image),
       is_published=COALESCE($7,is_published), published_at=COALESCE($8,published_at)
       WHERE id=$9`,
      [title, excerpt, content ? JSON.stringify(content) : null, category, read_time, cover_image, is_published, published_at, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/blog/:id (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM blog_posts WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
