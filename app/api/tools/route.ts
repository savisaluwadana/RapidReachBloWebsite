import { NextResponse } from "next/server";
import { getCategoriesByKind } from "@/lib/categories";
import { getTools } from "@/lib/tools";

export async function GET() {
  const [tools, categories] = await Promise.all([getTools(), getCategoriesByKind("tool")]);
  return NextResponse.json({ tools, categories, count: tools.length }, { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
