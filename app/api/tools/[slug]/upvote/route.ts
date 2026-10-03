import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, hasDatabase } from "@/lib/mongodb";
import {
  claimReaction,
  getReactionIdentity,
  hasReaction,
  reactionCount,
  releaseReaction,
} from "@/lib/reactions";

function noStoreJson(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, { ...init, headers: { "cache-control": "private, no-store" } });
}

async function findPublishedTool(slug: string) {
  const db = await getDb();
  const tool = await db.collection("tools").findOne(
    { slug, status: "published" },
    { projection: { upvotes: 1 } },
  );
  return { db, tool };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) return noStoreJson({ error: "Upvotes require MongoDB configuration." }, { status: 503 });

  const { slug } = await params;
  const [{ db, tool }, user] = await Promise.all([findPublishedTool(slug), getCurrentUser()]);
  if (!tool) return noStoreJson({ error: "Tool not found." }, { status: 404 });

  if (!user) {
    return noStoreJson({ upvotes: Number(tool.upvotes || 0), reacted: false, canReact: false });
  }

  const identity = getReactionIdentity(request, user.id);
  const reacted = await hasReaction(db, {
    kind: "tool-upvote",
    target: slug,
    actorHash: identity.actorHash,
  });
  const storedUpvotes = Number(tool.upvotes || 0);
  const recordedUpvotes = await reactionCount(db, "tool-upvote", slug);
  const upvotes = Math.max(storedUpvotes, recordedUpvotes);
  if (upvotes !== storedUpvotes) {
    await db.collection("tools").updateOne({ slug, status: "published" }, { $set: { upvotes } });
  }
  return noStoreJson({ upvotes, reacted, canReact: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) return noStoreJson({ error: "Upvotes require MongoDB configuration." }, { status: 503 });

  const { slug } = await params;
  const [{ db, tool }, user] = await Promise.all([findPublishedTool(slug), getCurrentUser()]);
  if (!tool) return noStoreJson({ error: "Tool not found." }, { status: 404 });

  if (!user) return noStoreJson({ error: "Sign in to upvote this tool.", reacted: false, canReact: false }, { status: 401 });

  const identity = getReactionIdentity(request, user.id);
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
      return noStoreJson({ error: "Tool not found." }, { status: 404 });
    }
    upvotes = Number(updated.upvotes || 0);
  }

  const recordedUpvotes = await reactionCount(db, "tool-upvote", slug);
  if (recordedUpvotes > upvotes) {
    upvotes = recordedUpvotes;
    await db.collection("tools").updateOne({ slug, status: "published" }, { $set: { upvotes } });
  }
  return noStoreJson({ upvotes, reacted: true, added: claimed, canReact: true });
}
