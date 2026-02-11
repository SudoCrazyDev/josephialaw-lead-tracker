-- Source is now from the webhook path; no source_id needed for new leads.

alter table public.leads add column if not exists webhook_path text;
alter table public.leads alter column source_id drop not null;

create index if not exists leads_webhook_path_idx on public.leads(webhook_path);
