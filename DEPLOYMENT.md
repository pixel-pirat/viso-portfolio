# Deployment Guide

Full-stack deployment: **NeonDB** (Postgres) → **Render** (API) → **Vercel** (Frontend)

---

## 1. NeonDB — Database Setup

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g. `digital-canvas-studio`)
3. Copy the **connection string** from the dashboard — it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this — you'll use it as `DATABASE_URL` in the next steps

---

## 2. Backend — Deploy to Render

### A. Prepare environment

Create `server/.env` (for local dev only — never commit):
```bash
cp server/.env.example server/.env
# Edit server/.env and fill in your DATABASE_URL and JWT_SECRET
```

### B. Run migration + seed locally (optional)

```bash
cd server
npm install
npm run build
npm run db:migrate     # creates all tables
npm run db:seed        # seeds with sample data
```

### C. Deploy to Render

1. Push your code to a GitHub repo
2. Go to [render.com](https://render.com) and create a free account
3. Click **New → Web Service** → connect your GitHub repo
4. Render will detect `render.yaml` automatically, or configure manually:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build && npm run db:migrate`
   - **Start Command**: `npm start`
   - **Node version**: 20
5. Add **Environment Variables** in the Render dashboard:
   - `DATABASE_URL` → your NeonDB connection string
   - `JWT_SECRET` → generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `NODE_ENV` → `production`
   - `ALLOWED_ORIGINS` → set after Vercel deploy (your Vercel URL)

6. Deploy and note your Render URL: `https://digital-canvas-studio-api.onrender.com`

7. Run seed data (first deploy only):
   - In Render dashboard → Shell tab → run: `npm run db:seed`

---

## 3. Frontend — Deploy to Vercel

### A. Configure environment variable

Create `.env.local` in the project root (for local dev):
```bash
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:3001 for dev
```

### B. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and create a free account
2. Click **New Project** → import your GitHub repo
3. Vercel auto-detects Vite. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL` → `https://digital-canvas-studio-api.onrender.com`
5. Deploy!

### C. Update CORS on Render

After Vercel gives you a URL (e.g. `https://digital-canvas-studio.vercel.app`):

1. Go back to Render → your API service → Environment
2. Set `ALLOWED_ORIGINS` → `https://digital-canvas-studio.vercel.app`
3. Render will redeploy automatically

---

## 4. Local Development

```bash
# Terminal 1 — API server
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate     # run once
npm run db:seed        # run once
npm run dev            # starts on port 3001

# Terminal 2 — Frontend
cp .env.example .env.local   # VITE_API_URL=http://localhost:3001
npm install
npm run dev                  # starts on port 5173
```

---

## 5. API Endpoints Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Login, returns JWT |
| GET | `/api/auth/me` | bearer | Current user info |
| GET | `/api/services` | public | Published services with tiers |
| GET | `/api/projects` | public | Published projects |
| GET | `/api/blog` | public | Published blog posts |
| GET | `/api/hero` | public | Hero slides + activity |
| GET | `/api/settings` | public | Brand/contact settings |
| POST | `/api/bookings` | public | Submit booking request |
| POST | `/api/contact` | public | Submit contact form |
| POST | `/api/appointments` | public | Book appointment |
| GET | `/api/collaborations` | public | Public collaborations |
| GET | `/api/collaborations/:id` | public | Collaboration detail |
| POST | `/api/collaborations` | bearer | Create collaboration |
| GET | `/api/proposals/mine` | bearer | Client's proposals |
| GET | `/api/client-projects/mine` | bearer | Client's projects |
| GET | `/api/appointments/mine` | bearer | Client's appointments |
| GET | `/api/bookings` | admin | All bookings |
| GET | `/api/proposals` | admin | All proposals |
| GET | `/api/client-projects` | admin | All client projects |
| GET | `/api/users` | admin | All accounts |
| PATCH | `/api/settings` | admin | Update settings |
| GET | `/health` | public | Health check |

---

## 6. Admin Access

Default admin credentials (created by seed):
- **Email**: `alex@studio.com`  
- **Password**: `studio2026`

**Change these immediately after first deploy.**

Go to `/admin` → login → Settings to update.
