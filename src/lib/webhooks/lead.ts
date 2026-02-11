import { getSupabaseServer } from "@/lib/supabase/server";
import type { LeadInsert } from "@/types/database";

export type WebhookLeadPayload = {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone?: string;
};

/**
 * Normalize payload into first_name, last_name, email, phone.
 * If first_name/last_name missing, splits name on first space.
 */
export function normalizeLeadPayload(payload: WebhookLeadPayload): {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
} {
  let first_name = (payload.first_name ?? "").trim();
  let last_name = (payload.last_name ?? "").trim();

  if (!first_name && !last_name && payload.name) {
    const parts = (payload.name as string).trim().split(/\s+/);
    first_name = parts[0] ?? "";
    last_name = parts.slice(1).join(" ") ?? "";
  }

  if (!first_name) first_name = "Unknown";

  return {
    first_name,
    last_name,
    email: (payload.email ?? "").trim(),
    phone: (payload.phone ?? "").trim(),
  };
}

/**
 * Insert a lead from a webhook. Source is the webhook path (e.g. "website/main-contact-form").
 * Returns { success: true, lead_id: string } or { error: string }.
 */
export async function insertLeadFromWebhook(
  webhookPath: string,
  payload: WebhookLeadPayload
): Promise<{ success: true; lead_id: string } | { error: string }> {
  const { first_name, last_name, email, phone } = normalizeLeadPayload(payload);
  if (!email) return { error: "Email is required." };

  const supabase = getSupabaseServer();
  const insert: LeadInsert = {
    first_name,
    last_name,
    email,
    phone,
    webhook_path: webhookPath,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from("leads").insert(insert as any).select("id").single();
  if (error) return { error: error.message };
  if (!data) return { error: "Failed to create lead." };

  return { success: true, lead_id: (data as { id: string }).id };
}
