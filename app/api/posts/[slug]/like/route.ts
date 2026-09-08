import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!hasDatabase()) return NextResponse.json({ error: "Likes require MongoDB configuration." }, { status: 503 });
  const { slug } = await params; const db = await getDb(); const result = await db.collection("posts").findOneAndUpdate({ slug, status: "published" }, { $inc: { likes: 1 } }, { returnDocument: "after" });
  if (!result) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ likes: Number(result.likes || 0) });
}
