import { createHash, randomBytes } from "node:crypto";
import type { Db } from "mongodb";
import { MongoServerError } from "mongodb";
import type { NextRequest, NextResponse } from "next/server";

export type ReactionKind = "post-like" | "tool-upvote";

const REACTION_COOKIE = "rapidreach_reaction_id";
const REACTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const REACTION_COLLECTION = "engagement_reactions";
let reactionIndexesPromise: Promise<void> | null = null;

function isValidReactionToken(value: string | undefined) {
  return Boolean(value && /^[A-Za-z0-9_-]{24,128}$/.test(value));
}

function hashReactionToken(token: string) {
  return createHash("sha256").update(`rapidreach:v1:${token}`).digest("hex");
}

export function getReactionIdentity(request: NextRequest) {
  const existingToken = request.cookies.get(REACTION_COOKIE)?.value;
  const token = isValidReactionToken(existingToken)
    ? existingToken as string
    : randomBytes(24).toString("base64url");

  return {
    actorHash: hashReactionToken(token),
    newCookieToken: token === existingToken ? null : token,
  };
}

export function applyReactionCookie(response: NextResponse, token: string | null) {
  if (!token) return;
  response.cookies.set(REACTION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REACTION_COOKIE_MAX_AGE,
  });
}

async function ensureReactionIndexes(db: Db) {
  if (!reactionIndexesPromise) {
    reactionIndexesPromise = db.collection(REACTION_COLLECTION)
      .createIndex(
        { kind: 1, target: 1, actorHash: 1 },
        { unique: true, name: "unique_reaction_per_actor" },
      )
      .then(() => undefined)
      .catch((error) => {
        reactionIndexesPromise = null;
        throw error;
      });
  }
  await reactionIndexesPromise;
}

export async function claimReaction(
  db: Db,
  input: { kind: ReactionKind; target: string; actorHash: string },
) {
  await ensureReactionIndexes(db);
  try {
    await db.collection(REACTION_COLLECTION).insertOne({
      ...input,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return false;
    throw error;
  }
}

export async function releaseReaction(
  db: Db,
  input: { kind: ReactionKind; target: string; actorHash: string },
) {
  await db.collection(REACTION_COLLECTION).deleteOne(input);
}
