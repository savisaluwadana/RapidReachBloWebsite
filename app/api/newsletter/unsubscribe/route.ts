import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

function redirectWithStatus(request: NextRequest, status: "1" | "error") {
  const response = NextResponse.redirect(new URL(`/briefing?unsubscribed=${status}`, request.url));
  response.headers.set("cache-control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token || !/^[a-f0-9]{48}$/i.test(token) || !hasDatabase()) {
    return redirectWithStatus(request, "error");
  }

  const db = await getDb();
  const result = await db.collection("newsletter_subscribers").updateOne(
    { unsubscribeToken: token },
    { $set: { status: "unsubscribed", updatedAt: new Date().toISOString() } },
  );

  return redirectWithStatus(request, result.matchedCount ? "1" : "error");
}
