import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug || !hasDatabase()) return NextResponse.json({ comments: [] });

  const db = await getDb();
  const docs = await db.collection("comments")
    .find({ postSlug: slug, status: { $ne: "hidden" } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({
    comments: docs.map((doc) => ({
      _id: String(doc._id),
      name: String(doc.name),
      body: String(doc.body),
      createdAt: String(doc.createdAt),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!hasDatabase()) return NextResponse.json({ error: "Comments require MongoDB configuration." }, { status: 503 });

  const input = await request.json().catch(() => ({}));
  const slug = String(input.slug || "").trim().slice(0, 180);
  const name = String(input.name || "").trim().slice(0, 60);
  const body = String(input.body || "").trim().slice(0, 1200);
  if (!slug || name.length < 1 || body.length < 2) {
    return NextResponse.json({ error: "Name and comment are required." }, { status: 400 });
  }

  const db = await getDb();
  const post = await db.collection("posts").findOne(
    { slug, status: "published" },
    { projection: { _id: 1 } },
  );
  if (!post) return NextResponse.json({ error: "Article not found." }, { status: 404 });

  const createdAt = new Date().toISOString();
  const result = await db.collection("comments").insertOne({ postSlug: slug, name, body, createdAt, status: "visible" });
  return NextResponse.json({ comment: { _id: String(result.insertedId), name, body, createdAt } }, { status: 201 });
}
