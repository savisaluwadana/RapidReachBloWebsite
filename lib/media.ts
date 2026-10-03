import { randomBytes } from "node:crypto";
import { del } from "@vercel/blob";
import { ensureDatabaseIndexes } from "@/lib/db-indexes";
import { getDb } from "@/lib/mongodb";

const USER_HOURLY_LIMIT = 20;
const USER_DAILY_LIMIT = 100;
const ADMIN_HOURLY_LIMIT = 120;
const MEDIA_EVENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

export async function reserveMediaUpload(ownerId: string, kind: string, admin = false) {
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const events = db.collection("media_upload_events");
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const hourly = await events.countDocuments({ ownerId, createdAt: { $gte: hourAgo } });
  if (hourly >= (admin ? ADMIN_HOURLY_LIMIT : USER_HOURLY_LIMIT)) {
    throw new Error("Upload limit reached. Try again later.");
  }
  if (!admin) {
    const daily = await events.countDocuments({ ownerId, createdAt: { $gte: dayAgo } });
    if (daily >= USER_DAILY_LIMIT) throw new Error("Daily upload limit reached. Try again tomorrow.");
  }

  const eventId = randomBytes(18).toString("hex");
  await events.insertOne({
    eventId,
    ownerId,
    kind,
    admin,
    status: "reserved",
    attached: false,
    createdAt: now,
    expiresAt: new Date(now.getTime() + MEDIA_EVENT_TTL_MS),
  });
  return eventId;
}

export async function completeMediaUpload(eventId: string, blob: { url?: string; pathname?: string; size?: number; contentType?: string }) {
  if (!eventId) return;
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const now = new Date();
  await db.collection("media_upload_events").updateOne(
    { eventId },
    {
      $set: {
        status: "uploaded",
        url: String(blob.url || ""),
        pathname: String(blob.pathname || ""),
        size: Number(blob.size || 0),
        contentType: String(blob.contentType || ""),
        completedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
        expiresAt: new Date(now.getTime() + MEDIA_EVENT_TTL_MS),
      },
    },
  );
}

export async function markMediaAttached(urls: Array<string | undefined | null>, ownerId?: string) {
  const clean = [...new Set(urls.filter((value): value is string => Boolean(value)))];
  if (!clean.length) return;
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const filter: Record<string, unknown> = { url: { $in: clean } };
  if (ownerId) filter.ownerId = ownerId;
  await db.collection("media_upload_events").updateMany(
    filter,
    { $set: { attached: true, attachedAt: new Date() } },
  );
}

export async function cleanupOrphanedMedia(limit = 100) {
  const db = await getDb();
  await ensureDatabaseIndexes(db);
  const cutoff = new Date(Date.now() - ORPHAN_GRACE_MS);
  const events = await db.collection("media_upload_events").find({
    status: "uploaded",
    attached: { $ne: true },
    completedAt: { $lt: cutoff },
    url: { $type: "string" },
  }).limit(Math.max(1, Math.min(limit, 500))).toArray();

  let deleted = 0;
  for (const event of events) {
    const url = String(event.url || "");
    if (!url) continue;
    try {
      await del(url);
      await db.collection("media_upload_events").updateOne(
        { _id: event._id },
        { $set: { status: "deleted", deletedAt: new Date() } },
      );
      deleted += 1;
    } catch (error) {
      console.error("RapidReach orphan media cleanup failed", url, error);
    }
  }
  return deleted;
}
