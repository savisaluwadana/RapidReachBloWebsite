import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !hasDatabase()) return NextResponse.redirect(new URL("/briefing?unsubscribed=error", request.url));
  const db = await getDb();
  const result = await db.collection("newsletter_subscribers").updateOne({ unsubscribeToken: token }, { $set: { status: "unsubscribed", updatedAt: new Date().toISOString() } });
  return NextResponse.redirect(new URL(result.matchedCount ? "/briefing?unsubscribed=1" : "/briefing?unsubscribed=error", request.url));
}
