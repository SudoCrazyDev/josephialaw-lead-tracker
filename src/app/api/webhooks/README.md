# Lead webhooks

Each webhook has its own URL. The lead’s **source** is the webhook path (e.g. `website/main-contact-form`); no separate source setup needed.

## Main Contact Form (website)

- **URL:** `POST /api/webhooks/website/main-contact-form`
- **Source:** Stored as `website/main-contact-form` on the lead.
- **Secret (optional):** Set `WEBHOOK_SECRET_MAIN_CONTACT` and send it as header `x-webhook-secret`.

**Body (JSON or form-urlencoded):**

- `email` (required)
- `first_name`, `last_name` — or `name` (split on first space)
- `phone` (optional)

**Example (JSON):**

```json
{
  "email": "jane@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "(555) 123-4567"
}
```

Or with a single name:

```json
{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "phone": "(555) 123-4567"
}
```

## Adding more webhooks

1. Create a source in the app with the desired **slug** (e.g. `ghl-forms`, `callrail`).
2. Add a route under `api/webhooks/...` (e.g. `api/webhooks/ghl/route.ts`).
3. Use `insertLeadFromWebhook(sourceSlug, payload)` from `@/lib/webhooks/lead` and your own secret/env if needed.
