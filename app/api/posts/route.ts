import { NextRequest, NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

function positiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export async function GET(request: NextRequest) {
  const limit = positiveInt(request.nextUrl.searchParams.get("limit"), 50, 100);
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset") || 0) || 0);
  const posts = await getPosts({ limit: limit + 1, skip: offset });
  const hasMore = posts.length > limit;
  const page = posts.slice(0, limit);
  const publicPosts = page.map((post) => {
    const { status, ...publicPost } = post;
    void status;
    return publicPost;
  });

  return NextResponse.json(
    {
      publication: "RapidReach",
      description: "Developer news and analysis",
      count: publicPosts.length,
      offset,
      limit,
      nextOffset: hasMore ? offset + publicPosts.length : null,
      posts: publicPosts,
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
