import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { query, queryOne } from "../db/pool";
import { signToken, requireAuth, AuthPayload } from "../middleware/auth";

const router = Router();

// Cookie is first-party now that the frontend proxies /api/* through its own
// domain (see vercel.json) — no more cross-site SameSite=None requirement.
const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
      };

      const existing = await queryOne("SELECT id FROM accounts WHERE email=$1", [email]);
      if (existing) {
        res.status(409).json({ error: "An account with that email already exists." });
        return;
      }

      const hash = await bcrypt.hash(password, 12);

      // Public registration always creates a "client" account. Admin/editor
      // accounts can only be created by an existing admin via POST /api/users.
      const [account] = await query<{ id: string; name: string; email: string; role: string }>(
        `INSERT INTO accounts (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'client')
         RETURNING id, name, email, role`,
        [name.trim(), email, hash]
      );

      const token = signToken({
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role as AuthPayload["role"],
      });

      res.cookie("token", token, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({ user: { id: account.id, name: account.name, email: account.email, role: account.role } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body as { email: string; password: string };

      const account = await queryOne<{ id: string; name: string; email: string; role: string; password_hash: string }>(
        `SELECT id, name, email, role, password_hash FROM accounts WHERE email=$1`,
        [email]
      );

      if (!account) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const valid = await bcrypt.compare(password, account.password_hash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
      }

      const token = signToken({
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role as AuthPayload["role"],
      });

      res.cookie("token", token, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({ user: { id: account.id, name: account.name, email: account.email, role: account.role } });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await queryOne<{ id: string; name: string; email: string; role: string; avatar_url: string }>(
      `SELECT id, name, email, role, avatar_url FROM accounts WHERE id=$1`,
      [req.user!.id]
    );
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json(account);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token", AUTH_COOKIE_OPTS);
  res.json({ success: true });
});

export default router;
