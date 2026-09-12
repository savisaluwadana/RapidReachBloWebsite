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
    return NextResponse.json({ error: "Upvotes require MongoDB configuration." }, { status: 503 });
  }

  const { slug } = await params;
  const db = await getDb();
  const tool = await db.collection("tools").findOne(
    { slug, status: "published" },
    { projection: { upvotes: 1 } },
  );
  if (!tool) return NextResponse.json({ error: "Tool not found." }, { status: 404 });

  const identity = getReactionIdentity(request);
  const reaction = {
    kind: "tool-upvote" as const,
    target: slug,
    actorHash: identity.actorHash,
  };
  const claimed = await claimReaction(db, reaction);

  let upvotes = Number(tool.upvotes || 0);
  if (claimed) {
    const updated = await db.collection("tools").findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { upvotes: 1 } },
      { returnDocument: "after", projection: { upvotes: 1 } },
    );

    if (!updated) {
      await releaseReaction(db, reaction);
      return NextResponse.json({ error: "Tool not found." }, { status: 404 });
    }
    upvotes = Number(updated.upvotes || 0);
  }

  const response = NextResponse.json({ upvotes, reacted: true });
  applyReactionCookie(response, identity.newCookieToken);
  return response;
}
