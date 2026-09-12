"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

export async function moderateComment(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const action = text(form, "action");
  if (!ObjectId.isValid(id) || !["hide", "show", "delete"].includes(action)) {
    throw new Error("Invalid comment moderation action.");
  }

  const db = await getDb();
  const commentId = new ObjectId(id);
  const comment = await db.collection("comments").findOne(
    { _id: commentId },
    { projection: { postSlug: 1 } },
  );
  if (!comment) return;

  if (action === "delete") {
    await db.collection("comments").deleteOne({ _id: commentId });
  } else {
    await db.collection("comments").updateOne(
      { _id: commentId },
      { $set: { status: action === "hide" ? "hidden" : "visible", moderatedAt: new Date().toISOString() } },
    );
  }

  const postSlug = String(comment.postSlug || "");
  revalidatePath("/admin/comments");
  if (postSlug) revalidatePath(`/news/${postSlug}`);
}
