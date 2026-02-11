import { NextRequest, NextResponse } from "next/server";
import { insertLeadFromWebhook } from "@/lib/webhooks/lead";
import { createWebhookLog } from "@/lib/webhooks/log";

const WEBHOOK_PATH = "website/main-contact-form";
const SECRET_HEADER = "x-webhook-secret";

/** Map WordPress / Contact Form 7-style fields to our payload. */
function normalizePayload(body: Record<string, unknown>): {
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone?: string;
} {
  const first = (body.first_name ?? body["first-name"]) as string | undefined;
  const last = (body.last_name ?? body["last-name"]) as string | undefined;
  const name = body.name as string | undefined;
  const email = (body.email ?? body["your-email"]) as string | undefined;
  const phone = (body.phone ?? body["Phone"]) as string | undefined;

  return {
    first_name: first?.trim(),
    last_name: last?.trim(),
    name: name?.trim(),
    email: email?.trim() ?? "",
    phone: phone?.trim(),
  };
}

export async function POST(request: NextRequest) {
  console.log("[main-contact-form] POST received");
  let statusCode = 500;
  let responseBody: Record<string, unknown> = { error: "Internal error" };
  let requestBody: Record<string, unknown> = {};
  let errorMessage: string | null = null;
  let leadId: string | null = null;

  try {
    const expectedSecret = process.env.WEBHOOK_SECRET_MAIN_CONTACT;
    if (expectedSecret) {
      const secret = request.headers.get(SECRET_HEADER);
      if (secret !== expectedSecret) {
        console.log("[main-contact-form] Auth failed: invalid or missing x-webhook-secret");
        statusCode = 401;
        responseBody = { error: "Unauthorized" };
        errorMessage = "Invalid or missing x-webhook-secret";
        await createWebhookLog({
          webhook_path: WEBHOOK_PATH,
          method: "POST",
          status_code: statusCode,
          request_body: requestBody,
          response_body: responseBody,
          error_message: errorMessage,
        });
        return NextResponse.json(responseBody, { status: statusCode });
      }
    }
    console.log("[main-contact-form] Auth OK (or no secret configured)");

    const contentType = request.headers.get("content-type") ?? "";
    console.log("[main-contact-form] Content-Type:", contentType);

    if (contentType.includes("application/json")) {
      requestBody = (await request.json()) as Record<string, unknown>;
      console.log("[main-contact-form] Parsed JSON body:", JSON.stringify(requestBody));
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      requestBody = {
        first_name: params.get("first_name") ?? undefined,
        "first-name": params.get("first-name") ?? undefined,
        last_name: params.get("last_name") ?? undefined,
        "last-name": params.get("last-name") ?? undefined,
        name: params.get("name") ?? undefined,
        email: params.get("email") ?? params.get("your-email") ?? undefined,
        "your-email": params.get("your-email") ?? undefined,
        phone: params.get("phone") ?? params.get("Phone") ?? undefined,
        Phone: params.get("Phone") ?? undefined,
      };
      console.log("[main-contact-form] Parsed form body:", JSON.stringify(requestBody));
    } else {
      console.log("[main-contact-form] Unsupported Content-Type, returning 415");
      statusCode = 415;
      responseBody = {
        error: "Content-Type must be application/json or application/x-www-form-urlencoded",
      };
      errorMessage = responseBody.error as string;
      await createWebhookLog({
        webhook_path: WEBHOOK_PATH,
        method: "POST",
        status_code: statusCode,
        request_body: requestBody,
        response_body: responseBody,
        error_message: errorMessage,
      });
      return NextResponse.json(responseBody, { status: statusCode });
    }

    const payload = normalizePayload(requestBody);
    console.log("[main-contact-form] Normalized payload:", JSON.stringify(payload));

    const result = await insertLeadFromWebhook(WEBHOOK_PATH, payload);
    console.log("[main-contact-form] insertLeadFromWebhook result:", JSON.stringify(result));

    if ("error" in result) {
      errorMessage = result.error;
      if (result.error === "Email is required.") {
        statusCode = 400;
      } else {
        statusCode = 500;
      }
      responseBody = { error: result.error };
    } else {
      statusCode = 201;
      responseBody = { success: true };
      leadId = result.lead_id;
    }

    console.log("[main-contact-form] Creating webhook log, status:", statusCode);
    await createWebhookLog({
      webhook_path: WEBHOOK_PATH,
      method: "POST",
      status_code: statusCode,
      request_body: requestBody,
      response_body: responseBody,
      error_message: errorMessage,
      lead_id: leadId,
    });

    console.log("[main-contact-form] Success, returning", statusCode);
    return NextResponse.json(responseBody, { status: statusCode });
  } catch (err) {
    console.error("[main-contact-form] Caught error:", err);
    statusCode = 400;
    responseBody = { error: "Invalid request body" };
    errorMessage = "Invalid request body";
    await createWebhookLog({
      webhook_path: WEBHOOK_PATH,
      method: "POST",
      status_code: statusCode,
      request_body: requestBody,
      response_body: responseBody,
      error_message: errorMessage,
    });
    return NextResponse.json(responseBody, { status: statusCode });
  }
}
