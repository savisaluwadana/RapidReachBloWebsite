import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/account-email";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  const verified = await verifyEmailToken(token);
  const url = new URL("/login", request.url);
  url.searchParams.set("verified", verified ? "1" : "0");
  const response = NextResponse.redirect(url);
  response.headers.set("cache-control", "no-store");
  return response;
}
