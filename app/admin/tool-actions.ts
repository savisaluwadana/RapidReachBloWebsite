"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

async function pullStringReference(
  database: Awaited<ReturnType<typeof getDb>>,
  collectionName: string,
  filter: Record<string, unknown>,
  field: string,
  value: string,
) {
  await database.collection(collectionName).updateMany(filter, [
    {
      $set: {
        [field]: {
          $filter: {
            input: { $ifNull: [`$${field}`, []] },
            as: "item",
            cond: { $ne: ["$$item", value] },
          },
        },
      },
    },
  ]);
}

export async function deleteTool(form: FormData) {
  await requireAdmin();
  const database = await getDb();
  const slug = text(form, "slug");
  if (!slug) throw new Error("Tool is required.");

  const result = await database.collection("tools").deleteOne({ slug });
  if (result.deletedCount) {
    const now = new Date().toISOString();
    await Promise.all([
      pullStringReference(database, "posts", { relatedToolSlugs: slug }, "relatedToolSlugs", slug),
      pullStringReference(database, "tools", { alternatives: slug }, "alternatives", slug),
      pullStringReference(database, "collections", { toolSlugs: slug }, "toolSlugs", slug),
      pullStringReference(database, "user_preferences", { savedTools: slug }, "savedTools", slug),
      database.collection("engagement_reactions").deleteMany({ kind: "tool-upvote", target: slug }),
      database.collection("tool_submissions").updateMany(
        { convertedToolSlug: slug },
        { $unset: { convertedToolSlug: "" }, $set: { updatedAt: now } },
      ),
    ]);
  }

  revalidatePath("/tools");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/launches");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin/tools");
  revalidatePath("/admin/submissions");
  redirect("/admin/tools");
}
