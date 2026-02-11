-- Run this in Supabase Dashboard → SQL Editor AFTER schema.sql
-- Adds slug column to sources for easy matching (e.g. webhooks).
-- Spaces → -, duplicates → -1, -2, …

-- Add column (nullable first so we can backfill)
alter table public.sources add column if not exists slug text;

-- Backfill slug from name: lowercase, replace non-alphanumeric with single -
-- Duplicates get -1, -2, … by created_at order
update public.sources s
set slug = sub.slug
from (
  select
    id,
    base_slug || case when rn > 1 then '-' || (rn - 1)::text else '' end as slug
  from (
    select
      id,
      regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g') as base_slug,
      row_number() over (
        partition by regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
        order by created_at
      ) as rn
    from public.sources
  ) t
  where base_slug <> ''
) sub
where s.id = sub.id;

-- Fallback for empty slug
update public.sources set slug = 'source-' || substr(id::text, 1, 8) where slug is null or slug = '';

-- Enforce not null and unique
alter table public.sources alter column slug set not null;
alter table public.sources add constraint sources_slug_key unique (slug);
create index if not exists sources_slug_idx on public.sources(slug);
