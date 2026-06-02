import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

async function buildClientProject(row: Record<string, unknown>) {
  const [milestones, messages, invoices] = await Promise.all([
    query(
      `SELECT id, title, description, status, due_date, deliverables, sort_order FROM milestones WHERE client_project_id=$1 ORDER BY sort_order`,
      [row.id]
    ),
    query(
      `SELECT id, author_id, author_name, author_role, body, created_at FROM project_messages WHERE client_project_id=$1 ORDER BY created_at`,
      [row.id]
    ),
    query(
      `SELECT id, number, description, amount, status, milestone_id, due_date, paid_at, reminders, created_at FROM invoices WHERE client_project_id=$1 ORDER BY created_at`,
      [row.id]
    ),
  ]);
  return { ...row, milestones, messages, invoices };
}

// GET /api/client-projects (admin)
router.get("/", requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, proposal_id, client_id, client_name, client_email, title, service_slug, tier_id, stage, progress, started_at, created_at FROM client_projects ORDER BY created_at DESC`
    );
    const projects = await Promise.all(rows.map(buildClientProject));
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/client-projects/mine (client)
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await query(
      `SELECT id, proposal_id, client_id, client_name, client_email, title, service_slug, tier_id, stage, progress, started_at FROM client_projects WHERE client_id=$1 ORDER BY started_at DESC`,
      [req.user!.id]
    );
    const projects = await Promise.all(rows.map(buildClientProject));
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// GET /api/client-projects/:id
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(
      `SELECT id, proposal_id, client_id, client_name, client_email, title, service_slug, tier_id, stage, progress, started_at FROM client_projects WHERE id=$1`,
      [req.params.id]
    );
    if (!row) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user!.role === "client" && (row as { client_id: string }).client_id !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const project = await buildClientProject(row);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// POST /api/client-projects (admin)
router.post("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposal_id, client_id, client_name, client_email, title, service_slug, tier_id, stage = "kickoff", progress = 0 } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO client_projects (proposal_id, client_id, client_name, client_email, title, service_slug, tier_id, stage, progress)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [proposal_id || null, client_id, client_name, client_email, title, service_slug, tier_id, stage, progress]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/client-projects/:id (admin)
router.patch("/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, stage, progress, service_slug, tier_id } = req.body;
    await query(
      `UPDATE client_projects SET title=COALESCE($1,title), stage=COALESCE($2,stage), progress=COALESCE($3,progress),
       service_slug=COALESCE($4,service_slug), tier_id=COALESCE($5,tier_id) WHERE id=$6`,
      [title, stage, progress, service_slug, tier_id, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/client-projects/:id/messages (auth)
router.post("/:id/messages", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body: msgBody } = req.body;
    if (!msgBody?.trim()) {
      res.status(422).json({ error: "Message body is required" });
      return;
    }
    const project = await queryOne<{ client_id: string }>(
      `SELECT client_id FROM client_projects WHERE id=$1`,
      [req.params.id]
    );
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user!.role === "client" && project.client_id !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const role = ["admin", "editor"].includes(req.user!.role) ? "admin" : "client";
    const [msg] = await query<{ id: string }>(
      `INSERT INTO project_messages (client_project_id, author_id, author_name, author_role, body)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [req.params.id, req.user!.id, req.user!.name, role, msgBody]
    );
    res.status(201).json({ id: msg.id });
  } catch (err) {
    next(err);
  }
});

// POST /api/client-projects/:id/milestones (admin)
router.post("/:id/milestones", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status = "pending", due_date, sort_order = 0 } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO milestones (client_project_id, title, description, status, due_date, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [req.params.id, title, description || null, status, due_date || null, sort_order]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/client-projects/:projectId/milestones/:id (admin)
router.patch("/:projectId/milestones/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, due_date } = req.body;
    await query(
      `UPDATE milestones SET title=COALESCE($1,title), description=COALESCE($2,description),
       status=COALESCE($3,status), due_date=COALESCE($4,due_date) WHERE id=$5 AND client_project_id=$6`,
      [title, description, status, due_date, req.params.id, req.params.projectId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/client-projects/:id/invoices (admin)
router.post("/:id/invoices", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { number, description, amount, status = "draft", milestone_id, due_date } = req.body;
    const [row] = await query<{ id: string }>(
      `INSERT INTO invoices (client_project_id, number, description, amount, status, milestone_id, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.params.id, number, description, amount, status, milestone_id || null, due_date || null]
    );
    res.status(201).json({ id: row.id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/client-projects/:projectId/invoices/:id (admin)
router.patch("/:projectId/invoices/:id", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, paid_at } = req.body;
    await query(
      `UPDATE invoices SET status=COALESCE($1,status), paid_at=COALESCE($2,paid_at) WHERE id=$3 AND client_project_id=$4`,
      [status, paid_at || null, req.params.id, req.params.projectId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
