import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/collaborations (public — only active + public)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, stage } = req.query;
    let sql = `SELECT id, owner_id, owner_name, title, summary, category, tags, skills_needed, roles_needed, stage, visibility, funding_status, funding_goal, team_size, requires_nda, cover_image, status, created_at
               FROM collaborations WHERE status='active'`;
    const params: unknown[] = [];
    // public-facing only shows public and invite_only (not private_preview)
    sql += ` AND visibility IN ('public','invite_only')`;
    if (category) { params.push(category); sql += ` AND category=$${params.length}`; }
    if (stage) { params.push(stage); sql += ` AND stage=$${params.length}`; }
    sql += ` ORDER BY created_at DESC`;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/all (admin)
router.get("/all", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, owner_id, owner_name, owner_email, title, summary, category, stage, visibility, status, created_at FROM collaborations ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/mine (auth)
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, owner_id, owner_name, title, summary, category, stage, visibility, status, created_at FROM collaborations WHERE owner_id=$1 ORDER BY created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, owner_id, owner_name, title, summary, description, goals, category, tags, skills_needed, roles_needed,
       stage, visibility, funding_status, funding_goal, team_size, requires_nda, cover_image, status, created_at, updated_at
       FROM collaborations WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "Collaboration not found" });
      return;
    }
    // Fetch updates
    const updates = await query(
      `SELECT id, author_id, author_name, author_role, kind, body, created_at FROM collaboration_updates WHERE collaboration_id=$1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ ...row, updates });
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations (auth)
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, summary, description, goals, category, tags = [], skills_needed = [],
      roles_needed = [], stage = "idea", visibility = "public", funding_status = "n/a",
      funding_goal, team_size = 1, requires_nda = false, cover_image
    } = req.body;

    // Check consent
    const consent = await queryOne(
      `SELECT accepted_at FROM collab_consents WHERE account_id=$1`,
      [req.user!.id]
    );
    if (!consent) {
      res.status(403).json({ error: "Must accept collaboration terms before posting" });
      return;
    }

    const [row] = await query<{ id: string }>(
      `INSERT INTO collaborations (owner_id, owner_name, owner_email, title, summary, description, goals, category, tags, skills_needed, roles_needed, stage, visibility, funding_status, funding_goal, team_size, requires_nda, cover_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
      [req.user!.id, req.user!.name, req.user!.email, title, summary, description, goals, category,
       JSON.stringify(tags), JSON.stringify(skills_needed), JSON.stringify(roles_needed),
       stage, visibility, funding_status, funding_goal || null, team_size, requires_nda, cover_image || null]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/collaborations/:id (owner or admin)
router.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne<{ owner_id: string }>(
      `SELECT owner_id FROM collaborations WHERE id=$1`,
      [req.params.id]
    );
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    const isAdmin = ["admin", "editor"].includes(req.user!.role);
    if (!isAdmin && row.owner_id !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }

    const { title, summary, description, goals, category, tags, skills_needed, roles_needed, stage, visibility, funding_status, funding_goal, team_size, requires_nda, cover_image, status } = req.body;
    await query(
      `UPDATE collaborations SET
       title=COALESCE($1,title), summary=COALESCE($2,summary), description=COALESCE($3,description),
       goals=COALESCE($4,goals), category=COALESCE($5,category),
       tags=COALESCE($6,tags), skills_needed=COALESCE($7,skills_needed), roles_needed=COALESCE($8,roles_needed),
       stage=COALESCE($9,stage), visibility=COALESCE($10,visibility),
       funding_status=COALESCE($11,funding_status), funding_goal=COALESCE($12,funding_goal),
       team_size=COALESCE($13,team_size), requires_nda=COALESCE($14,requires_nda),
       cover_image=COALESCE($15,cover_image), status=COALESCE($16,status)
       WHERE id=$17`,
      [title, summary, description, goals, category,
       tags ? JSON.stringify(tags) : null,
       skills_needed ? JSON.stringify(skills_needed) : null,
       roles_needed ? JSON.stringify(roles_needed) : null,
       stage, visibility, funding_status, funding_goal, team_size, requires_nda, cover_image,
       isAdmin ? status : null,
       req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations/:id/requests (auth)
router.post("/:id/requests", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kind = "join", role, message } = req.body;
    if (!message?.trim()) { res.status(422).json({ error: "Message is required" }); return; }
    const [row] = await query<{ id: string }>(
      `INSERT INTO collaboration_requests (collaboration_id, user_id, user_name, user_email, kind, role, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.params.id, req.user!.id, req.user!.name, req.user!.email, kind, role || null, message]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/:id/requests (owner or admin)
router.get("/:id/requests", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collab = await queryOne<{ owner_id: string }>(`SELECT owner_id FROM collaborations WHERE id=$1`, [req.params.id]);
    if (!collab) { res.status(404).json({ error: "Not found" }); return; }
    const isAdmin = ["admin", "editor"].includes(req.user!.role);
    if (!isAdmin && collab.owner_id !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }
    const rows = await query(
      `SELECT id, user_id, user_name, user_email, kind, role, message, status, created_at FROM collaboration_requests WHERE collaboration_id=$1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/collaborations/:id/my-requests (auth — own requests only)
router.get("/:id/my-requests", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, user_id, user_name, user_email, kind, role, message, status, created_at
       FROM collaboration_requests
       WHERE collaboration_id=$1 AND user_id=$2
       ORDER BY created_at DESC`,
      [req.params.id, req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/collaborations/:id/requests/:rid (owner or admin)
router.patch("/:id/requests/:rid", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collab = await queryOne<{ owner_id: string }>(`SELECT owner_id FROM collaborations WHERE id=$1`, [req.params.id]);
    if (!collab) { res.status(404).json({ error: "Not found" }); return; }
    const isAdmin = ["admin", "editor"].includes(req.user!.role);
    if (!isAdmin && collab.owner_id !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }
    await query(`UPDATE collaboration_requests SET status=$1 WHERE id=$2`, [req.body.status, req.params.rid]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations/:id/updates (auth — founder/contributor)
router.post("/:id/updates", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kind = "update", body: updateBody, authorRole = "contributor" } = req.body;
    if (!updateBody?.trim()) { res.status(422).json({ error: "Body is required" }); return; }
    const [row] = await query<{ id: string }>(
      `INSERT INTO collaboration_updates (collaboration_id, author_id, author_name, author_role, kind, body)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [req.params.id, req.user!.id, req.user!.name, authorRole, kind, updateBody]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations/:id/reports (auth)
router.post("/:id/reports", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason, details } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO collaboration_reports (collaboration_id, reporter_id, reporter_name, reason, details)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [req.params.id, req.user!.id, req.user!.name, reason, details]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/collaborations/consent (auth)
router.post("/consent", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await query(
      `INSERT INTO collab_consents (account_id, version) VALUES ($1,$2)
       ON CONFLICT (account_id) DO UPDATE SET accepted_at=NOW(), version=$2`,
      [req.user!.id, req.body.version || "1.0"]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
