import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

function validToken(value: string) {
  return /^[a-f0-9]{48}$/i.test(value);
}

function briefingRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/briefing", request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  const url = new URL("/unsubscribe", request.url);
  if (validToken(token)) url.searchParams.set("token", token);
  else url.searchParams.set("error", "invalid");
  const response = NextResponse.redirect(url);
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return briefingRedirect(request, { subscription: "error" });

  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") || "").trim();
  const intent = String(form?.get("intent") || "").trim();
  if (!validToken(token) || !["unsubscribe", "resubscribe"].includes(intent)) {
    return briefingRedirect(request, { subscription: "error" });
  }

  const db = await getDb();
  const now = new Date().toISOString();
  const status = intent === "resubscribe" ? "active" : "unsubscribed";
  const update = intent === "resubscribe"
    ? { status, updatedAt: now, resubscribedAt: now }
    : { status, updatedAt: now, unsubscribedAt: now };

  const result = await db.collection("newsletter_subscribers").updateOne(
    { unsubscribeToken: token },
    { $set: update },
  );

  if (!result.matchedCount) return briefingRedirect(request, { subscription: "error" });
  return intent === "resubscribe"
    ? briefingRedirect(request, { resubscribed: "1" })
    : briefingRedirect(request, { unsubscribed: "1" });
}
