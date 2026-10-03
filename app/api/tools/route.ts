import { NextRequest, NextResponse } from "next/server";
import { getCategoriesByKind } from "@/lib/categories";
import { getTools } from "@/lib/tools";

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function nonNegativeInt(value: string | null, fallback = 0, max = 10_000) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback;
}

export async function GET(request: NextRequest) {
  const limit = positiveInt(request.nextUrl.searchParams.get("limit"), 50, 100);
  const offset = nonNegativeInt(request.nextUrl.searchParams.get("offset"));
  const [tools, categories] = await Promise.all([
    getTools({ limit: limit + 1, skip: offset }),
    getCategoriesByKind("tool"),
  ]);
  const hasMore = tools.length > limit;
  const page = tools.slice(0, limit);
  return NextResponse.json(
    { tools: page, categories, count: page.length, offset, limit, nextOffset: hasMore ? offset + page.length : null },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
