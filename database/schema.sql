-- ============================================================
-- Portfolio Studio — PostgreSQL Schema
-- ============================================================
-- Run order: extensions → enums → tables → indexes → triggers → seeds
-- Tested on PostgreSQL 14+
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive emails

-- ---------- ENUMS ----------
do $$ begin
  create type project_category as enum ('Web', 'Mobile', 'Branding', 'Media');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_status as enum ('new', 'in_review', 'replied', 'archived');
exception when duplicate_object then null; end $$;

-- ---------- UTILITY: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  short        text not null,
  icon         text,                       -- lucide icon name (e.g. "Code2")
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists service_problems (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  body        text not null,
  position    int  not null default 0
);

create table if not exists service_process_steps (
  id          uuid primary key default gen_random_uuid(),
  service_id  uuid not null references services(id) on delete cascade,
  step        text not null,
  body        text not null,
  position    int  not null default 0
);

create index if not exists idx_service_problems_service on service_problems(service_id);
create index if not exists idx_service_steps_service    on service_process_steps(service_id);

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  category     project_category not null,
  excerpt      text not null,
  problem      text,
  solution     text,
  cover_image  text,
  is_featured  boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists project_tools (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  position    int  not null default 0
);

create table if not exists project_results (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  metric      text not null,
  label       text not null,
  position    int  not null default 0
);

create table if not exists project_media (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  url         text not null,
  alt         text,
  kind        text not null default 'image' check (kind in ('image','video')),
  position    int  not null default 0
);

create index if not exists idx_projects_category   on projects(category);
create index if not exists idx_projects_featured   on projects(is_featured) where is_featured = true;
create index if not exists idx_projects_published  on projects(is_published, published_at desc);
create index if not exists idx_project_tools_pid   on project_tools(project_id);
create index if not exists idx_project_results_pid on project_results(project_id);
create index if not exists idx_project_media_pid   on project_media(project_id);

-- ============================================================
-- BLOG
-- ============================================================
create table if not exists blog_categories (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null
);

create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  excerpt       text not null,
  content       text not null,                -- markdown or plain text
  category_id   uuid references blog_categories(id) on delete set null,
  read_time_min int  not null default 5,
  cover_image   text,
  is_published  boolean not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists blog_tags (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table if not exists blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id  uuid not null references blog_tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists idx_blog_posts_published on blog_posts(is_published, published_at desc);
create index if not exists idx_blog_posts_category  on blog_posts(category_id);

-- ============================================================
-- CONTACT FORM SUBMISSIONS
-- ============================================================
create table if not exists contact_submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           citext not null,
  company         text,
  budget_range    text,
  project_details text not null,
  source          text,                  -- e.g. "contact_page", "service_detail"
  status          contact_status not null default 'new',
  user_agent      text,
  ip_address      inet,
  created_at      timestamptz not null default now()
);

create index if not exists idx_contact_status  on contact_submissions(status);
create index if not exists idx_contact_created on contact_submissions(created_at desc);

-- ============================================================
-- NEWSLETTER (optional)
-- ============================================================
create table if not exists newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           citext unique not null,
  is_confirmed    boolean not null default false,
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================
drop trigger if exists trg_services_updated   on services;
create trigger trg_services_updated   before update on services
  for each row execute function set_updated_at();

drop trigger if exists trg_projects_updated   on projects;
create trigger trg_projects_updated   before update on projects
  for each row execute function set_updated_at();

drop trigger if exists trg_blog_posts_updated on blog_posts;
create trigger trg_blog_posts_updated before update on blog_posts
  for each row execute function set_updated_at();

-- ============================================================
-- SEED DATA (mirrors src/data/site.ts)
-- ============================================================
insert into services (slug, title, short, icon, sort_order) values
  ('web-development',        'Website / Web App Development', 'High-performance websites and web apps engineered to convert.', 'Code2',      1),
  ('mobile-development',     'Mobile App Development',        'Native-feeling iOS and Android apps users actually keep open.', 'Smartphone', 2),
  ('social-media',           'Social Media Management',       'Strategy, content, and community that builds real audience.',   'Share2',     3),
  ('photography-videography','Photography & Videography',     'Cinematic visuals that elevate your brand presence.',           'Camera',     4),
  ('branding',               'Graphic Design & Branding',     'Identity systems that look premium across every touchpoint.',   'Palette',    5)
on conflict (slug) do nothing;

insert into blog_categories (slug, name) values
  ('design',      'Design'),
  ('engineering', 'Engineering'),
  ('branding',    'Branding'),
  ('process',     'Process')
on conflict (slug) do nothing;

-- ============================================================
-- OPTIONAL: Row-Level Security template (uncomment for Supabase)
-- ============================================================
-- alter table services             enable row level security;
-- alter table projects             enable row level security;
-- alter table blog_posts           enable row level security;
-- alter table contact_submissions  enable row level security;
--
-- create policy "Public read services"  on services
--   for select using (is_published = true);
-- create policy "Public read projects"  on projects
--   for select using (is_published = true);
-- create policy "Public read blog"      on blog_posts
--   for select using (is_published = true);
-- create policy "Public insert contact" on contact_submissions
--   for insert with check (true);
