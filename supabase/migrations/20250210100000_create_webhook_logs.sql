-- Webhook request logs for monitoring and debugging

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_path text not null,
  method text not null default 'POST',
  status_code int not null,
  request_body jsonb,
  response_body jsonb,
  error_message text,
  lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists webhook_logs_created_at_idx on public.webhook_logs(created_at desc);
create index if not exists webhook_logs_webhook_path_idx on public.webhook_logs(webhook_path);
create index if not exists webhook_logs_status_code_idx on public.webhook_logs(status_code);

alter table public.webhook_logs enable row level security;
