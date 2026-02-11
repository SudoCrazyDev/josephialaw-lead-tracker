import { getSupabaseServer } from "@/lib/supabase/server";

export type CreateWebhookLogParams = {
  webhook_path: string;
  method: string;
  status_code: number;
  request_body?: Record<string, unknown> | null;
  response_body?: Record<string, unknown> | null;
  error_message?: string | null;
  lead_id?: string | null;
};

/**
 * Log a webhook request. Call this for every webhook invocation (success or failure).
 */
export async function createWebhookLog(params: CreateWebhookLogParams): Promise<void> {
  const supabase = getSupabaseServer();
  await supabase.from("webhook_logs").insert({
    webhook_path: params.webhook_path,
    method: params.method,
    status_code: params.status_code,
    request_body: params.request_body ?? null,
    response_body: params.response_body ?? null,
    error_message: params.error_message ?? null,
    lead_id: params.lead_id ?? null,
  });
}
