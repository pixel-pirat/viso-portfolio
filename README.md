# VISO

A modern creative studio platform — websites, apps, and brands for ambitious teams.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript → deployed on Render
- **Database**: NeonDB (PostgreSQL)
- **Frontend deployment**: Vercel

## Local development

```bash
# Backend
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate
npm run db:seed
npm run dev            # runs on port 3001

# Frontend (separate terminal)
cp .env.example .env.local   # set VITE_API_URL=http://localhost:3001
npm install
npm run dev            # runs on port 5173
```

See `DEPLOYMENT.md` for full production deployment instructions.
