"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

/** Base URL for webhook testing (e.g. localtunnel). Server-only. */
export async function getAppUrl(): Promise<string> {
  return process.env.NEXT_APP_URL ?? "";
}

/** Webhook endpoints to show full URLs for testing. */
export const WEBHOOK_ENDPOINTS = [
  { path: "website/main-contact-form", label: "Main Contact Form" },
] as const;

export type WebhookLogRow = {
  id: string;
  webhook_path: string;
  method: string;
  status_code: number;
  request_body: Record<string, unknown> | null;
  response_body: Record<string, unknown> | null;
  error_message: string | null;
  lead_id: string | null;
  created_at: string;
};

export async function getWebhookLogs(options?: {
  webhook_path?: string;
  status_code?: number;
  limit?: number;
  offset?: number;
}) {
  const supabase = getSupabaseServer();
  let query = supabase
    .from("webhook_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.webhook_path) {
    query = query.eq("webhook_path", options.webhook_path);
  }
  if (options?.status_code !== undefined) {
    query = query.eq("status_code", options.status_code);
  }

  const limit = Math.min(options?.limit ?? 50, 100);
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as WebhookLogRow[];
}

export async function getWebhookPaths() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("webhook_logs")
    .select("webhook_path")
    .order("webhook_path");

  if (error) throw error;
  const paths = [...new Set((data ?? []).map((r) => r.webhook_path))];
  return paths;
}
