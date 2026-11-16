-- RoadAlongapo — Supabase schema, RLS, triggers and storage
-- Run this whole file in the Supabase SQL editor (fresh project).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

create extension if not exists "pgcrypto";

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'citizen',
  status text not null default 'active',
  barangay text,
  position text,
  contact text,
  user_name text,
  avatar_url text,
  password_changed boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  category text,
  description text,
  location text,
  lat double precision,
  lng double precision,
  image_url text,
  status text default 'Pending',
  upvotes int default 0,
  upvoted_by text[] default '{}',
  community_images jsonb default '[]'::jsonb,
  reported_by uuid references auth.users(id),
  reporter_name text,
  barangay text,
  assigned_team text,
  progress_stage int,
  repair_stage text,
  work_description text,
  barangay_remarks text,
  verified_at timestamptz,
  rejected_at timestamptz,
  resolve_image_url text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_barangay_idx on public.reports (barangay);
create index if not exists reports_status_idx on public.reports (status);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  barangay text not null,
  sender_id uuid references auth.users(id),
  sender_name text,
  sender_role text,
  text text,
  read_by_engineer boolean default false,
  read_by_barangay boolean default false,
  created_at timestamptz default now()
);

create index if not exists messages_barangay_created_idx on public.messages (barangay, created_at);

create table if not exists public.official_requests (
  id uuid primary key default gen_random_uuid(),
  uid uuid references auth.users(id) on delete cascade,
  name text,
  email text,
  position text,
  barangay text,
  contact text,
  requested_role text default 'barangay',
  status text default 'pending',
  documents jsonb default '[]'::jsonb,
  notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level text,
  message text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  snapshot jsonb,
  created_at timestamptz default now()
);

-- ── Helpers ─────────────────────────────────────────────────────────────────

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'citizen');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_official()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('barangay', 'engineer', 'admin')
      and status = 'active'
  );
$$;

-- Create a profile automatically for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status, barangay, position, contact, password_changed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'user'), '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    coalesce(new.raw_user_meta_data->>'status', 'active'),
    new.raw_user_meta_data->>'barangay',
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'contact',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.messages enable row level security;
alter table public.official_requests enable row level security;
alter table public.system_logs enable row level security;
alter table public.backups enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- reports: everyone signed in can read; citizens create their own; officials update.
drop policy if exists "reports_select_authenticated" on public.reports;
create policy "reports_select_authenticated" on public.reports
  for select using (auth.uid() is not null);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() is not null and reported_by = auth.uid());

drop policy if exists "reports_update_official" on public.reports;
create policy "reports_update_official" on public.reports
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "reports_delete_admin" on public.reports;
create policy "reports_delete_admin" on public.reports
  for delete using (public.is_admin());

-- messages: signed-in users can read and send; officials mark read.
drop policy if exists "messages_select_authenticated" on public.messages;
create policy "messages_select_authenticated" on public.messages
  for select using (auth.uid() is not null);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() is not null and sender_id = auth.uid());

drop policy if exists "messages_update_authenticated" on public.messages;
create policy "messages_update_authenticated" on public.messages
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- official requests
drop policy if exists "requests_select_own_or_admin" on public.official_requests;
create policy "requests_select_own_or_admin" on public.official_requests
  for select using (uid = auth.uid() or public.is_admin());

drop policy if exists "requests_insert_own" on public.official_requests;
create policy "requests_insert_own" on public.official_requests
  for insert with check (uid = auth.uid());

drop policy if exists "requests_update_admin" on public.official_requests;
create policy "requests_update_admin" on public.official_requests
  for update using (public.is_admin())
  with check (public.is_admin());

-- logs / backups: admin only
drop policy if exists "logs_admin_all" on public.system_logs;
create policy "logs_admin_all" on public.system_logs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "backups_admin_all" on public.backups;
create policy "backups_admin_all" on public.backups
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Storage ─────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('report-images', 'report-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('official-documents', 'official-documents', false)
on conflict (id) do nothing;

drop policy if exists "report_images_read" on storage.objects;
create policy "report_images_read" on storage.objects
  for select using (bucket_id = 'report-images');

drop policy if exists "report_images_write" on storage.objects;
create policy "report_images_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'report-images');

drop policy if exists "report_images_update" on storage.objects;
create policy "report_images_update" on storage.objects
  for update to authenticated using (bucket_id = 'report-images');

drop policy if exists "report_images_delete" on storage.objects;
create policy "report_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'report-images');

drop policy if exists "official_documents_read" on storage.objects;
create policy "official_documents_read" on storage.objects
  for select to authenticated using (
    bucket_id = 'official-documents' and (owner = auth.uid() or public.is_admin())
  );

drop policy if exists "official_documents_write" on storage.objects;
create policy "official_documents_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'official-documents');

drop policy if exists "official_documents_delete" on storage.objects;
create policy "official_documents_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'official-documents' and (owner = auth.uid() or public.is_admin())
  );

-- ── Seed the first admin (optional) ─────────────────────────────────────────
-- 1. Create the user in Authentication → Users (email + password).
-- 2. Then run this, replacing the email:
-- update public.profiles
--   set role = 'admin', status = 'active', password_changed = true
--   where email = 'admin@roadalongapo.gov.ph';
