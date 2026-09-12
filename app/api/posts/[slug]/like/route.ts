import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";
import {
  applyReactionCookie,
  claimReaction,
  getReactionIdentity,
  releaseReaction,
} from "@/lib/reactions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Likes require MongoDB configuration." }, { status: 503 });
  }

  const { slug } = await params;
  const db = await getDb();
  const post = await db.collection("posts").findOne(
    { slug, status: "published" },
    { projection: { likes: 1 } },
  );
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const identity = getReactionIdentity(request);
  const reaction = {
    kind: "post-like" as const,
    target: slug,
    actorHash: identity.actorHash,
  };
  const claimed = await claimReaction(db, reaction);

  let likes = Number(post.likes || 0);
  if (claimed) {
    const updated = await db.collection("posts").findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { likes: 1 } },
      { returnDocument: "after", projection: { likes: 1 } },
    );

    if (!updated) {
      await releaseReaction(db, reaction);
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }
    likes = Number(updated.likes || 0);
  }

  const response = NextResponse.json({ likes, reacted: true });
  applyReactionCookie(response, identity.newCookieToken);
  return response;
}
