-- ============================================================================
--  Dipisha Chhetri — portfolio database
--  Applied by `npm run db:setup`. Safe to run more than once.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  admin_users — who may sign in to /admin. Created by `npm run create:admin`.
-- ---------------------------------------------------------------------------
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  name          text not null default '',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  profile — the single row behind the hero, the about page and the footer
-- ---------------------------------------------------------------------------
create table if not exists profile (
  id              int primary key default 1 check (id = 1),
  full_name       text not null default 'Dipisha Chhetri',
  first_name      text not null default 'Dipisha',
  last_name       text not null default 'Chhetri',
  headline        text not null default '',
  location        text not null default '',
  tagline         text not null default '',
  about           text not null default '',
  avatar_url      text,
  resume_url      text,
  email           text not null default '',
  phone           text not null default '',
  available       boolean not null default true,
  available_text  text not null default 'Open to work',
  hero_cta_label  text not null default 'See the work',
  hero_cta_href   text not null default '/work',
  socials         jsonb not null default '[]'::jsonb,
  stats           jsonb not null default '[]'::jsonb,
  seo_title       text not null default '',
  seo_description text not null default '',
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  sections — every heading on the site, renameable and hideable
-- ---------------------------------------------------------------------------
create table if not exists sections (
  key        text primary key,
  eyebrow    text not null default '',
  title      text not null default '',
  subtitle   text not null default '',
  visible    boolean not null default true,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
--  skills
-- ---------------------------------------------------------------------------
create table if not exists skills (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text not null default 'General',
  level      int not null default 3 check (level between 1 and 5),
  visible    boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  services
-- ---------------------------------------------------------------------------
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text not null default 'sparkle',
  tags        text[] not null default '{}',
  visible     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  slug       text not null unique,
  kind       text not null default 'Project',
  summary    text not null default '',
  body       text not null default '',
  cover_url  text,
  gallery    jsonb not null default '[]'::jsonb,
  tech       text[] not null default '{}',
  live_url   text,
  repo_url   text,
  year       text not null default '',
  featured   boolean not null default false,
  visible    boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  timeline — education, work and certificates in one table
-- ---------------------------------------------------------------------------
create table if not exists timeline (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  org         text not null default '',
  kind        text not null default 'education',
  period      text not null default '',
  description text not null default '',
  url         text,
  visible     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  messages — the contact form inbox
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null default '',
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  media — every uploaded file, so the admin can list and delete them
-- ---------------------------------------------------------------------------
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  url         text not null,
  mime_type   text not null default '',
  size_bytes  int not null default 0,
  folder      text not null default 'uploads',
  -- The object's key inside the Supabase Storage bucket. Kept alongside the
  -- URL so a file can be deleted without having to parse its address back.
  storage_key text,
  created_at  timestamptz not null default now()
);

-- For databases created before storage moved off local disk.
alter table media add column if not exists storage_key text;

create index if not exists projects_visible_idx on projects (visible, sort_order);
create index if not exists skills_visible_idx on skills (visible, sort_order);
create index if not exists messages_read_idx on messages (read, created_at desc);
create index if not exists media_folder_idx on media (folder, created_at desc);
