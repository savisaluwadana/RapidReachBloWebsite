"use server";

import { MongoServerError } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, hasDatabase } from "@/lib/mongodb";

export type PostSaveState = { error: string };

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function list(form: FormData, key: string) {
  return text(form, key).split(",").map((item) => item.trim()).filter(Boolean);
}

function uniqueList(form: FormData, key: string, limit: number) {
  return [...new Set(list(form, key))].slice(0, limit);
}

function lines(form: FormData, key: string) {
  return text(form, key).split("\n").map((item) => item.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function iso(value: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Enter a valid publish date and time.");
  return date.toISOString();
}

function readingMinutes(value: string) {
  if (!value) return 4;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Reading time must be a number.");
  return Math.max(1, Math.min(180, Math.round(parsed)));
}

async function requireExistingToolSlugs(database: Awaited<ReturnType<typeof getDb>>, slugs: string[]) {
  if (!slugs.length) return;
  const existing = await database.collection("tools")
    .find({ slug: { $in: slugs } }, { projection: { slug: 1 } })
    .toArray();
  const found = new Set(existing.map((item) => String(item.slug)));
  const missing = slugs.filter((slug) => !found.has(slug));
  if (missing.length) throw new Error(`Related tool not found: ${missing.join(", ")}`);
}

function friendlySaveError(error: unknown) {
  if (error instanceof MongoServerError && error.code === 11000) {
    return "Another post already uses that slug. Choose a different slug and save again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "The post could not be saved. Check the fields and try again.";
}

export async function savePostWithFeedback(
  _previousState: PostSaveState,
  form: FormData,
): Promise<PostSaveState> {
  await requireAdmin();

  let savedSlug = "";
  let originalSlug = "";

  try {
    if (!hasDatabase()) throw new Error("MongoDB must be configured before saving posts.");
    const database = await getDb();
    const posts = database.collection("posts");

    originalSlug = text(form, "originalSlug");
    const title = text(form, "title").slice(0, 240);
    const slug = slugify(text(form, "slug") || title);
    const summary = text(form, "summary").slice(0, 1000);
    const content = text(form, "content").slice(0, 100_000);

    if (!title || !slug) throw new Error("Post title is required.");
    if (!summary) throw new Error("Post summary is required.");
    if (!content) throw new Error("Article body is required.");

    const featuredImageUrl = text(form, "featuredImageUrl");
    if (featuredImageUrl && !validHttpsUrl(featuredImageUrl)) {
      throw new Error("Featured image must use a valid HTTPS URL.");
    }

    const category = text(form, "category");
    if (!category) throw new Error("Choose a post category.");
    const categoryExists = await database.collection("categories").findOne(
      { kind: "post", name: category },
      { projection: { _id: 1 } },
    );
    if (!categoryExists) {
      throw new Error(`The category “${category}” no longer exists. Refresh the editor and choose a current category.`);
    }

    const relatedToolSlugs = uniqueList(form, "relatedToolSlugs", 12);
    await requireExistingToolSlugs(database, relatedToolSlugs);

    const document = {
      slug,
      title,
      summary,
      content,
      category,
      author: text(form, "author").slice(0, 160) || "RapidReach Editorial",
      publishedAt: iso(text(form, "publishedAt")),
      updatedAt: new Date().toISOString(),
      featuredImageUrl: featuredImageUrl || undefined,
      readingMinutes: readingMinutes(text(form, "readingMinutes")),
      tags: uniqueList(form, "tags", 20).map((tag) => tag.slice(0, 100)),
      keyTakeaways: lines(form, "keyTakeaways").slice(0, 12).map((item) => item.slice(0, 500)),
      relatedToolSlugs,
      status: text(form, "status") === "published" ? "published" : "draft",
    };

    if (originalSlug) {
      if (slug !== originalSlug && await posts.findOne({ slug }, { projection: { _id: 1 } })) {
        throw new Error("Another post already uses that slug. Choose a different slug and save again.");
      }

      const result = await posts.updateOne({ slug: originalSlug }, { $set: document });
      if (!result.matchedCount) throw new Error("This post no longer exists. Refresh the editor before saving again.");

      if (slug !== originalSlug) {
        await Promise.all([
          database.collection("tools").updateMany(
            { relatedPostSlugs: originalSlug },
            { $set: { "relatedPostSlugs.$[item]": slug } },
            { arrayFilters: [{ item: originalSlug }] },
          ),
          database.collection("collections").updateMany(
            { postSlugs: originalSlug },
            { $set: { "postSlugs.$[item]": slug } },
            { arrayFilters: [{ item: originalSlug }] },
          ),
          database.collection("user_preferences").updateMany(
            { savedPosts: originalSlug },
            { $set: { "savedPosts.$[item]": slug } },
            { arrayFilters: [{ item: originalSlug }] },
          ),
          database.collection("comments").updateMany({ postSlug: originalSlug }, { $set: { postSlug: slug } }),
          database.collection("engagement_reactions").updateMany(
            { kind: "post-like", target: originalSlug },
            { $set: { target: slug } },
          ),
        ]);
      }
    } else {
      if (await posts.findOne({ slug }, { projection: { _id: 1 } })) {
        throw new Error("Another post already uses that slug. Choose a different slug and save again.");
      }
      await posts.insertOne({ ...document, likes: 0 });
    }

    savedSlug = slug;
  } catch (error) {
    console.error("RapidReach post save failed", error);
    return { error: friendlySaveError(error) };
  }

  revalidatePath("/");
  revalidatePath("/signals");
  revalidatePath("/briefing");
  revalidatePath("/search");
  revalidatePath("/admin/posts");
  revalidatePath(`/news/${savedSlug}`);
  revalidatePath("/tools");
  if (originalSlug && originalSlug !== savedSlug) revalidatePath(`/news/${originalSlug}`);
  redirect("/admin/posts");
}
