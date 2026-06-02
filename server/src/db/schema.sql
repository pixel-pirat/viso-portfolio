-- ============================================================
-- Digital Canvas Studio — Full PostgreSQL Schema
-- For NeonDB (PostgreSQL 15+)
-- ============================================================

-- ---------- EXTENSIONS ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE project_category AS ENUM ('Web', 'Mobile', 'Branding', 'Media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contact_status AS ENUM ('new', 'in_review', 'replied', 'won', 'lost', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE blog_category AS ENUM ('Design', 'Engineering', 'Branding', 'Process');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'review', 'done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE client_project_stage AS ENUM ('kickoff', 'discovery', 'design', 'development', 'review', 'delivered');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_stage AS ENUM ('idea', 'validating', 'building', 'launched', 'scaling');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_visibility AS ENUM ('public', 'invite_only', 'private_preview');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_funding_status AS ENUM ('self_funded', 'seeking', 'funded', 'n/a');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_status AS ENUM ('active', 'flagged', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_request_kind AS ENUM ('join', 'interest', 'investor', 'contact');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_request_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collab_update_kind AS ENUM ('update', 'discussion', 'log');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE account_role AS ENUM ('admin', 'editor', 'viewer', 'client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_kind AS ENUM ('message', 'proposal', 'invoice', 'project_update', 'appointment', 'reminder');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- UTILITY: updated_at trigger ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- ACCOUNTS (users + clients)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         account_role NOT NULL DEFAULT 'client',
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_accounts_updated ON accounts;
CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  short        TEXT NOT NULL,
  icon         TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_problems (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_process_steps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  step       TEXT NOT NULL,
  body       TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tier_key    TEXT NOT NULL,
  name        TEXT NOT NULL,
  price       TEXT NOT NULL,
  description TEXT NOT NULL,
  features    JSONB NOT NULL DEFAULT '[]',
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  cta_label   TEXT,
  position    INT NOT NULL DEFAULT 0
);

DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_service_problems_service ON service_problems(service_id);
CREATE INDEX IF NOT EXISTS idx_service_steps_service ON service_process_steps(service_id);
CREATE INDEX IF NOT EXISTS idx_service_tiers_service ON service_tiers(service_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  category     project_category NOT NULL,
  excerpt      TEXT NOT NULL,
  problem      TEXT,
  solution     TEXT,
  cover_image  TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  metric     TEXT NOT NULL,
  label      TEXT NOT NULL,
  position   INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  kind       TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  caption    TEXT,
  position   INT NOT NULL DEFAULT 0
);

DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(is_published, published_at DESC);

-- ============================================================
-- BLOG
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  content       JSONB NOT NULL DEFAULT '[]',
  category      blog_category NOT NULL DEFAULT 'Design',
  read_time     TEXT NOT NULL DEFAULT '5 min',
  cover_image   TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT TRUE,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_blog_posts_updated ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- ============================================================
-- HERO SLIDES + ACTIVITY
-- ============================================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow    TEXT NOT NULL,
  title      TEXT NOT NULL,
  subtitle   TEXT NOT NULL,
  cta_label  TEXT NOT NULL,
  cta_href   TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT NOT NULL CHECK (kind IN ('project', 'blog', 'service', 'note')),
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        CITEXT NOT NULL,
  service_slug TEXT NOT NULL,
  tier_id      TEXT NOT NULL,
  message      TEXT NOT NULL,
  status       contact_status NOT NULL DEFAULT 'new',
  client_id    UUID REFERENCES accounts(id) ON DELETE SET NULL,
  attachments  JSONB NOT NULL DEFAULT '[]',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- ============================================================
-- PROPOSALS
-- ============================================================
CREATE TABLE IF NOT EXISTS proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  client_id       UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_name     TEXT NOT NULL,
  client_email    CITEXT NOT NULL,
  service_slug    TEXT NOT NULL,
  tier_id         TEXT NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  scope           JSONB NOT NULL DEFAULT '[]',
  price           TEXT NOT NULL,
  timeline_weeks  INT NOT NULL DEFAULT 4,
  status          proposal_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at      TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS trg_proposals_updated ON proposals;
CREATE TRIGGER trg_proposals_updated BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_proposals_client ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- ============================================================
-- CLIENT PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS client_projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  UUID REFERENCES proposals(id) ON DELETE SET NULL,
  client_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  client_email CITEXT NOT NULL,
  title        TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  tier_id      TEXT NOT NULL,
  stage        client_project_stage NOT NULL DEFAULT 'kickoff',
  progress     INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          milestone_status NOT NULL DEFAULT 'pending',
  due_date        DATE,
  deliverables    JSONB NOT NULL DEFAULT '[]',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  author_name       TEXT NOT NULL,
  author_role       TEXT NOT NULL CHECK (author_role IN ('admin', 'client')),
  body              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
  number            TEXT NOT NULL,
  description       TEXT NOT NULL,
  amount            TEXT NOT NULL,
  status            invoice_status NOT NULL DEFAULT 'draft',
  milestone_id      UUID REFERENCES milestones(id) ON DELETE SET NULL,
  due_date          DATE,
  paid_at           TIMESTAMPTZ,
  reminders         JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_client_projects_updated ON client_projects;
CREATE TRIGGER trg_client_projects_updated BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_milestones_updated ON milestones;
CREATE TRIGGER trg_milestones_updated BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_invoices_updated ON invoices;
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_client_projects_client ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(client_project_id);
CREATE INDEX IF NOT EXISTS idx_messages_project ON project_messages(client_project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(client_project_id);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES accounts(id) ON DELETE SET NULL,
  client_name  TEXT NOT NULL,
  client_email CITEXT NOT NULL,
  service_slug TEXT,
  date         DATE NOT NULL,
  time         TEXT NOT NULL,
  duration_min INT NOT NULL DEFAULT 60,
  notes        TEXT,
  status       appointment_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_appointments_updated ON appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       notification_kind NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  href       TEXT,
  audience   TEXT NOT NULL DEFAULT 'admin',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_audience ON notifications(audience, is_read, created_at DESC);

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           CITEXT NOT NULL,
  company         TEXT,
  budget_range    TEXT,
  project_details TEXT NOT NULL,
  source          TEXT,
  status          contact_status NOT NULL DEFAULT 'new',
  user_agent      TEXT,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);

-- ============================================================
-- NEWSLETTER
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE NOT NULL,
  is_confirmed    BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at    TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COLLABORATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS collaborations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  owner_name      TEXT NOT NULL,
  owner_email     CITEXT NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  description     TEXT NOT NULL,
  goals           TEXT NOT NULL,
  category        TEXT NOT NULL,
  tags            JSONB NOT NULL DEFAULT '[]',
  skills_needed   JSONB NOT NULL DEFAULT '[]',
  roles_needed    JSONB NOT NULL DEFAULT '[]',
  stage           collab_stage NOT NULL DEFAULT 'idea',
  visibility      collab_visibility NOT NULL DEFAULT 'public',
  funding_status  collab_funding_status NOT NULL DEFAULT 'n/a',
  funding_goal    TEXT,
  team_size       INT NOT NULL DEFAULT 1,
  requires_nda    BOOLEAN NOT NULL DEFAULT FALSE,
  attachments     JSONB NOT NULL DEFAULT '[]',
  cover_image     TEXT,
  status          collab_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaboration_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_name        TEXT NOT NULL,
  user_email       CITEXT NOT NULL,
  kind             collab_request_kind NOT NULL DEFAULT 'join',
  role             TEXT,
  message          TEXT NOT NULL,
  status           collab_request_status NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaboration_updates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  author_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  author_name      TEXT NOT NULL,
  author_role      TEXT NOT NULL CHECK (author_role IN ('founder', 'contributor', 'visitor')),
  kind             collab_update_kind NOT NULL DEFAULT 'update',
  body             TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaboration_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  reporter_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  reporter_name    TEXT NOT NULL,
  reason           TEXT NOT NULL CHECK (reason IN ('plagiarism', 'abuse', 'spam', 'ip_violation', 'other')),
  details          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_consents (
  account_id   UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  accepted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version      TEXT NOT NULL DEFAULT '1.0'
);

DROP TRIGGER IF EXISTS trg_collaborations_updated ON collaborations;
CREATE TRIGGER trg_collaborations_updated BEFORE UPDATE ON collaborations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_collab_requests_updated ON collaboration_requests;
CREATE TRIGGER trg_collab_requests_updated BEFORE UPDATE ON collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaborations_owner ON collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_collab_requests_collab ON collaboration_requests(collaboration_id);
CREATE INDEX IF NOT EXISTS idx_collab_updates_collab ON collaboration_updates(collaboration_id);

-- ============================================================
-- SETTINGS (single-row config)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id               INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  contact_email    TEXT NOT NULL DEFAULT 'hello@studio.com',
  contact_location TEXT NOT NULL DEFAULT 'Remote — working worldwide',
  social_twitter   TEXT NOT NULL DEFAULT '',
  social_instagram TEXT NOT NULL DEFAULT '',
  social_linkedin  TEXT NOT NULL DEFAULT '',
  social_github    TEXT NOT NULL DEFAULT '',
  dev_name         TEXT NOT NULL DEFAULT 'Alex Morgan',
  dev_title        TEXT NOT NULL DEFAULT 'Founder & Lead Engineer',
  dev_bio          TEXT NOT NULL DEFAULT '',
  dev_avatar_url   TEXT NOT NULL DEFAULT '',
  dev_years_exp    INT NOT NULL DEFAULT 8,
  dev_location     TEXT NOT NULL DEFAULT '',
  brand_studio_name TEXT NOT NULL DEFAULT 'VISO',
  brand_legal_name  TEXT NOT NULL DEFAULT 'VISO inc',
  brand_tagline     TEXT NOT NULL DEFAULT 'We design digital experiences that perform.',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_settings_updated ON settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Ensure exactly one settings row exists
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
