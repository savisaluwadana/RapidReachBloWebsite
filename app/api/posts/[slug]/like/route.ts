import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb, hasDatabase } from "@/lib/mongodb";
import {
  claimReaction,
  getReactionIdentity,
  hasReaction,
  releaseReaction,
} from "@/lib/reactions";

async function findPublishedPost(slug: string) {
  const db = await getDb();
  const post = await db.collection("posts").findOne(
    { slug, status: "published" },
    { projection: { likes: 1 } },
  );
  return { db, post };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Likes require MongoDB configuration." }, { status: 503 });
  }

  const { slug } = await params;
  const [{ db, post }, user] = await Promise.all([findPublishedPost(slug), getCurrentUser()]);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  if (!user) {
    return NextResponse.json({
      likes: Number(post.likes || 0),
      reacted: false,
      canReact: false,
    });
  }

  const identity = getReactionIdentity(request, user.id);
  const reacted = await hasReaction(db, {
    kind: "post-like",
    target: slug,
    actorHash: identity.actorHash,
  });

  return NextResponse.json({
    likes: Number(post.likes || 0),
    reacted,
    canReact: true,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: "Likes require MongoDB configuration." }, { status: 503 });
  }

  const { slug } = await params;
  const [{ db, post }, user] = await Promise.all([findPublishedPost(slug), getCurrentUser()]);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to like this article.", reacted: false, canReact: false },
      { status: 401 },
    );
  }

  const identity = getReactionIdentity(request, user.id);
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

  return NextResponse.json({
    likes,
    reacted: true,
    added: claimed,
    canReact: true,
  });
}
