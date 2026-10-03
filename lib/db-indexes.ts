import type { Db } from "mongodb";

let indexesPromise: Promise<void> | null = null;

async function dedupeUserPreferences(db: Db) {
  const collection = db.collection("user_preferences");
  const duplicates = await collection.aggregate([
    { $match: { userId: { $type: "string" } } },
    { $group: { _id: "$userId", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]).toArray();

  for (const group of duplicates) {
    const docs = await collection.find({ _id: { $in: group.ids } }).toArray();
    if (!docs.length) continue;
    const [keep, ...remove] = docs;
    const savedTools = [...new Set(docs.flatMap((doc) => Array.isArray(doc.savedTools) ? doc.savedTools.map(String) : []))];
    const savedPosts = [...new Set(docs.flatMap((doc) => Array.isArray(doc.savedPosts) ? doc.savedPosts.map(String) : []))];
    const followedTopics = [...new Set(docs.flatMap((doc) => Array.isArray(doc.followedTopics) ? doc.followedTopics.map(String) : []))];
    await collection.updateOne(
      { _id: keep._id },
      {
        $set: {
          savedTools,
          savedPosts,
          followedTopics,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    if (remove.length) {
      await collection.deleteMany({ _id: { $in: remove.map((doc) => doc._id) } });
    }
  }
}

export async function ensureDatabaseIndexes(db: Db) {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      await dedupeUserPreferences(db);

      await Promise.all([
        db.collection("users").createIndex({ email: 1 }, { unique: true, name: "unique_user_email" }),
        db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true, name: "unique_session_token" }),
        db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expire_sessions" }),
        db.collection("tool_submissions").createIndex({ userId: 1, updatedAt: -1 }, { name: "user_submissions" }),
        db.collection("tool_submissions").createIndex({ status: 1, updatedAt: -1 }, { name: "submission_status" }),
        db.collection("newsletter_subscribers").createIndex({ email: 1 }, { unique: true, name: "unique_newsletter_email" }),
        db.collection("user_preferences").createIndex({ userId: 1 }, { unique: true, name: "unique_user_preferences" }),
        db.collection("engagement_reactions").createIndex(
          { kind: 1, target: 1, actorHash: 1 },
          { unique: true, name: "unique_reaction_per_actor" },
        ),
        db.collection("engagement_reactions").createIndex({ kind: 1, target: 1 }, { name: "reaction_counts" }),
        db.collection("comments").createIndex({ postSlug: 1, createdAt: -1 }, { name: "comments_by_post" }),
        db.collection("account_tokens").createIndex({ tokenHash: 1 }, { unique: true, name: "unique_account_token" }),
        db.collection("account_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expire_account_tokens" }),
        db.collection("account_tokens").createIndex({ userId: 1, kind: 1, createdAt: -1 }, { name: "account_token_rate" }),
        db.collection("media_upload_events").createIndex({ eventId: 1 }, { unique: true, name: "unique_media_event" }),
        db.collection("media_upload_events").createIndex({ ownerId: 1, createdAt: -1 }, { name: "media_quota" }),
        db.collection("media_upload_events").createIndex({ attached: 1, completedAt: 1 }, { name: "orphaned_media" }),
        db.collection("media_upload_events").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expire_media_events" }),
        db.collection("newsletter_signup_events").createIndex({ key: 1, createdAt: -1 }, { name: "newsletter_signup_rate" }),
        db.collection("newsletter_signup_events").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "expire_newsletter_signup_events" }),
        db.collection("briefing_send_jobs").createIndex({ sendKey: 1 }, { unique: true, name: "unique_briefing_send" }),
      ]);
    })().catch((error) => {
      indexesPromise = null;
      throw error;
    });
  }
  return indexesPromise;
}
