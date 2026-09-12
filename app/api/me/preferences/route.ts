import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategoriesByKind } from "@/lib/categories";
import { getPostBySlug } from "@/lib/posts";
import { getPreferences, togglePreference } from "@/lib/preferences";
import { getToolBySlug } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null, preferences: null }, { status: 401, headers: { "cache-control": "private, no-store" } });
  return NextResponse.json({ user: { role: user.role }, preferences: await getPreferences(user.id) }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save items." }, { status: 401 });

  const body = await request.json().catch(() => null) as { kind?: string; value?: string } | null;
  const kind = body?.kind;
  const value = String(body?.value || "").trim().slice(0, 180);
  if (!value || !["tool", "post", "topic"].includes(String(kind))) {
    return NextResponse.json({ error: "Invalid preference." }, { status: 400 });
  }

  let exists = false;
  if (kind === "tool") exists = Boolean(await getToolBySlug(value));
  if (kind === "post") exists = Boolean(await getPostBySlug(value));
  if (kind === "topic") {
    const categories = await getCategoriesByKind("post");
    exists = categories.some((category) => category.name === value);
  }

  if (!exists) {
    return NextResponse.json({ error: "This item is no longer available." }, { status: 404 });
  }

  const result = await togglePreference(user.id, kind as "tool" | "post" | "topic", value);
  return NextResponse.json(result, { headers: { "cache-control": "private, no-store" } });
}
