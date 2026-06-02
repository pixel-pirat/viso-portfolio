import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/users (admin)
router.get("/", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, name, email, role, avatar_url, created_at FROM accounts ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id (admin)
router.get("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, name, email, role, avatar_url, created_at FROM accounts WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// POST /api/users (admin — invite/create user)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role = "client" } = req.body;
    const existing = await queryOne(`SELECT id FROM accounts WHERE email=$1`, [email]);
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const hash = await bcrypt.hash(password || Math.random().toString(36).slice(2, 12), 12);
    const [row] = await query<{ id: string }>(
      `INSERT INTO accounts (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id`,
      [name, email, hash, role]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id (admin)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, avatar_url } = req.body;
    await query(
      `UPDATE accounts SET name=COALESCE($1,name), email=COALESCE($2,email), role=COALESCE($3,role), avatar_url=COALESCE($4,avatar_url) WHERE id=$5`,
      [name, email, role, avatar_url, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id (admin)
router.delete("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(`DELETE FROM accounts WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
