import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user: user ? { role: user.role } : null },
    { headers: { "cache-control": "private, no-store, max-age=0" } },
  );
}
