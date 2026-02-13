import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

/**
 * Creates a Retell web call and returns the access token for the frontend.
 * Token is valid for 30 seconds; call must be started within that window.
 * @see https://docs.retellai.com/api-references/create-web-call
 */
export async function POST() {
  if (!RETELL_API_KEY || !RETELL_AGENT_ID) {
    return NextResponse.json(
      { error: "Retell is not configured (RETELL_API_KEY, RETELL_AGENT_ID)" },
      { status: 500 }
    );
  }

  try {
    const client = new Retell({ apiKey: RETELL_API_KEY });
    const response = await client.call.createWebCall({
      agent_id: RETELL_AGENT_ID,
    });

    return NextResponse.json(
      {
        access_token: response.access_token,
        call_id: response.call_id,
        agent_name: response.agent_name,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Retell createWebCall error:", err);
    return NextResponse.json(
      { error: "Failed to create web call" },
      { status: 500 }
    );
  }
}
