import { NextResponse } from "next/server";
import { getPosts } from "@/lib/posts";

export async function GET() {
  const posts = await getPosts();
  const publicPosts = posts.map((post) => {
    const { status, ...publicPost } = post;
    void status;
    return publicPost;
  });

  return NextResponse.json(
    {
      publication: "RapidReach",
      description: "Developer news and analysis",
      count: publicPosts.length,
      posts: publicPosts,
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
