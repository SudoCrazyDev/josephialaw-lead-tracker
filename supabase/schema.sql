-- Run this in Supabase Dashboard → SQL Editor

-- Sources table (lead sources)
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  source_id uuid not null references public.sources(id) on delete restrict,
  created_at timestamptz default now()
);

-- Index for listing leads by date
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_source_id_idx on public.leads(source_id);

-- Seed default sources (run once; skip if you already have sources)
insert into public.sources (name)
select unnest(array['Website', 'GHL Forms', 'CallRail', 'GHL Funnels', 'Other'])
where not exists (select 1 from public.sources limit 1);

-- Enable RLS (optional; use service role in app for now)
alter table public.sources enable row level security;
alter table public.leads enable row level security;

-- Allow service role full access (default)
-- Add policies later for anon/auth if needed
