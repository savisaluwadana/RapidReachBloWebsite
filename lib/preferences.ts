import { getDb, hasDatabase } from "@/lib/mongodb";
import type { UserPreferences } from "@/lib/types";

const empty: UserPreferences = { savedTools: [], savedPosts: [], followedTopics: [] };

export async function getPreferences(userId: string): Promise<UserPreferences> {
  if (!hasDatabase()) return empty;
  try {
    const db = await getDb();
    const doc = await db.collection("user_preferences").findOne({ userId });
    return {
      savedTools: Array.isArray(doc?.savedTools) ? doc.savedTools.map(String) : [],
      savedPosts: Array.isArray(doc?.savedPosts) ? doc.savedPosts.map(String) : [],
      followedTopics: Array.isArray(doc?.followedTopics) ? doc.followedTopics.map(String) : [],
    };
  } catch {
    return empty;
  }
}

export async function togglePreference(userId: string, kind: "tool" | "post" | "topic", value: string) {
  const db = await getDb();
  const field = kind === "tool" ? "savedTools" : kind === "post" ? "savedPosts" : "followedTopics";
  const current = await db.collection("user_preferences").findOne({ userId });
  const values = Array.isArray(current?.[field]) ? current[field].map(String) : [];
  const saved = !values.includes(value);
  await db.collection("user_preferences").updateOne(
    { userId },
    saved
      ? { $addToSet: { [field]: value }, $set: { updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } }
      : { $pull: { [field]: value }, $set: { updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
  return { saved, preferences: await getPreferences(userId) };
}
