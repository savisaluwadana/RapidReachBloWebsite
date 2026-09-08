import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json({ publication: "RapidReach", description: "Developer news and analysis", count: posts.length, posts: posts.map(({ status: _status, ...post }) => post) }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
