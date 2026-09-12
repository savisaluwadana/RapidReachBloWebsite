import { NextRequest, NextResponse } from "next/server";
import { getDb, hasDatabase } from "@/lib/mongodb";
import {
  applyReactionCookie,
  claimReaction,
  getReactionIdentity,
  hasReaction,
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
  const { db, tool } = await findPublishedTool(slug);
  if (!tool) return noStoreJson({ error: "Tool not found." }, { status: 404 });

  const identity = getReactionIdentity(request);
  const reacted = await hasReaction(db, {
    kind: "tool-upvote",
    target: slug,
    actorHash: identity.actorHash,
  });
  const response = noStoreJson({ upvotes: Number(tool.upvotes || 0), reacted });
  applyReactionCookie(response, identity.newCookieToken);
  return response;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) return noStoreJson({ error: "Upvotes require MongoDB configuration." }, { status: 503 });

  const { slug } = await params;
  const { db, tool } = await findPublishedTool(slug);
  if (!tool) return noStoreJson({ error: "Tool not found." }, { status: 404 });

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
      return noStoreJson({ error: "Tool not found." }, { status: 404 });
    }
    upvotes = Number(updated.upvotes || 0);
  }

  const response = noStoreJson({ upvotes, reacted: true, added: claimed });
  applyReactionCookie(response, identity.newCookieToken);
  return response;
}
