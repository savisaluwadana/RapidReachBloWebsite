import { getDb, hasDatabase } from "@/lib/mongodb";
import type { UserPreferences } from "@/lib/types";

const empty: UserPreferences = { savedTools: [], savedPosts: [], followedTopics: [] };

type PreferenceDoc = {
  userId: string;
  savedTools?: string[];
  savedPosts?: string[];
  followedTopics?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export async function getPreferences(userId: string): Promise<UserPreferences> {
  if (!hasDatabase()) return empty;
  try {
    const db = await getDb();
    const doc = await db.collection<PreferenceDoc>("user_preferences").findOne({ userId });
    return {
      savedTools: doc?.savedTools || [],
      savedPosts: doc?.savedPosts || [],
      followedTopics: doc?.followedTopics || [],
    };
  } catch {
    return empty;
  }
}

export async function togglePreference(userId: string, kind: "tool" | "post" | "topic", value: string) {
  const db = await getDb();
  const collection = db.collection<PreferenceDoc>("user_preferences");
  const current = await collection.findOne({ userId });
  const values = kind === "tool" ? current?.savedTools || [] : kind === "post" ? current?.savedPosts || [] : current?.followedTopics || [];
  const saved = !values.includes(value);
  const now = new Date().toISOString();

  if (kind === "tool") {
    await collection.updateOne({ userId }, saved ? { $addToSet: { savedTools: value }, $set: { updatedAt: now }, $setOnInsert: { userId, createdAt: now } } : { $pull: { savedTools: value }, $set: { updatedAt: now } }, { upsert: true });
  } else if (kind === "post") {
    await collection.updateOne({ userId }, saved ? { $addToSet: { savedPosts: value }, $set: { updatedAt: now }, $setOnInsert: { userId, createdAt: now } } : { $pull: { savedPosts: value }, $set: { updatedAt: now } }, { upsert: true });
  } else {
    await collection.updateOne({ userId }, saved ? { $addToSet: { followedTopics: value }, $set: { updatedAt: now }, $setOnInsert: { userId, createdAt: now } } : { $pull: { followedTopics: value }, $set: { updatedAt: now } }, { upsert: true });
  }

  return { saved, preferences: await getPreferences(userId) };
}
