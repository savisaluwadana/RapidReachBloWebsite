import { NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";
import { getToolBySlug } from "@/lib/tools";

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!hasDatabase()) {
    const tool = await getToolBySlug(slug);
    return NextResponse.json({ upvotes: (tool?.upvotes || 0) + 1 });
  }
  const db = await getDb();
  const result = await db.collection("tools").findOneAndUpdate(
    { slug, status: "published" },
    { $inc: { upvotes: 1 } },
    { returnDocument: "after" },
  );
  if (!result) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  return NextResponse.json({ upvotes: Number(result.upvotes || 0) });
}
