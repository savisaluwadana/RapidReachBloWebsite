"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, logoutUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, hasDatabase } from "@/lib/mongodb";

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

function iso(value: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error("Enter a valid date and time.");
  return date.toISOString();
}

function validHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateOptionalUrl(value: string, label: string) {
  if (value && !validHttpUrl(value)) throw new Error(`${label} must be a valid http/https URL.`);
}

function readingMinutes(value: string) {
  if (!value) return 4;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error("Reading time must be a number.");
  return Math.max(1, Math.min(180, Math.round(parsed)));
}

async function db() {
  if (!hasDatabase()) throw new Error("MongoDB must be configured before using the CMS.");
  return getDb();
}

async function requireExistingSlugs(
  database: Awaited<ReturnType<typeof getDb>>,
  collectionName: "posts" | "tools",
  slugs: string[],
  label: string,
) {
  if (!slugs.length) return;
  const existing = await database.collection(collectionName)
    .find({ slug: { $in: slugs } }, { projection: { slug: 1 } })
    .toArray();
  const found = new Set(existing.map((item) => String(item.slug)));
  const missing = slugs.filter((slug) => !found.has(slug));
  if (missing.length) throw new Error(`${label} not found: ${missing.join(", ")}`);
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

export async function loginAdmin(form: FormData) {
  const result = await loginUser({ email: text(form, "email"), password: text(form, "password"), requireRole: "admin" });
  if (!result.ok) redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
  redirect("/admin");
}

export async function logoutAdmin() {
  await logoutUser();
  redirect("/admin/login");
}

export async function saveCategory(form: FormData) {
  await requireAdmin();
  const database = await db();
  const categories = database.collection("categories");
  const name = text(form, "name").slice(0, 120);
  const kind = text(form, "kind") === "tool" ? "tool" : "post";
  const originalSlug = text(form, "originalSlug");
  const originalName = text(form, "originalName");
  const slug = slugify(text(form, "slug") || name);
  if (!name || !slug) throw new Error("Category name is required.");

  if (originalSlug) {
    if (slug !== originalSlug && await categories.findOne({ slug, kind }, { projection: { _id: 1 } })) {
      throw new Error("Another category already uses that slug.");
    }
    const result = await categories.updateOne(
      { slug: originalSlug, kind },
      { $set: { name, slug, kind, description: text(form, "description").slice(0, 1000), updatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) throw new Error("This category no longer exists. Refresh before saving again.");
  } else {
    if (await categories.findOne({ slug, kind }, { projection: { _id: 1 } })) {
      throw new Error("Another category already uses that slug.");
    }
    const now = new Date().toISOString();
    await categories.insertOne({ name, slug, kind, description: text(form, "description").slice(0, 1000), createdAt: now, updatedAt: now });
  }

  if (kind === "post" && originalName && originalName !== name) {
    await Promise.all([
      database.collection("posts").updateMany({ category: originalName }, { $set: { category: name } }),
      database.collection("user_preferences").updateMany(
        { followedTopics: originalName },
        { $set: { "followedTopics.$[topic]": name } },
        { arrayFilters: [{ topic: originalName }] },
      ),
    ]);
    revalidatePath(`/category/${encodeURIComponent(originalName)}`);
  }
  if (kind === "tool" && originalSlug && originalSlug !== slug) {
    await database.collection("tools").updateMany({ category: originalSlug }, { $set: { category: slug } });
    revalidatePath(`/tools/category/${originalSlug}`);
  }

  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const database = await db();
  const slug = text(form, "slug");
  const kind = text(form, "kind") === "tool" ? "tool" : "post";
  if (!slug) throw new Error("Category is required.");

  const category = await database.collection("categories").findOne({ slug, kind });
  if (!category) return;

  const reference = kind === "tool"
    ? await database.collection("tools").findOne({ category: slug }, { projection: { _id: 1 } })
    : await database.collection("posts").findOne({ category: String(category.name || "") }, { projection: { _id: 1 } });

  if (reference) throw new Error("Move or remove content from this category before deleting it.");

  await database.collection("categories").deleteOne({ slug, kind });
  if (kind === "post") {
    await pullStringReference(
      database,
      "user_preferences",
      { followedTopics: String(category.name || "") },
      "followedTopics",
      String(category.name || ""),
    );
  }
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath("/admin/categories");
}

export async function savePost(form: FormData) {
  await requireAdmin();
  const database = await db();
  const posts = database.collection("posts");
  const originalSlug = text(form, "originalSlug");
  const title = text(form, "title").slice(0, 240);
  const slug = slugify(text(form, "slug") || title);
  if (!title || !slug) throw new Error("Post title is required.");

  const featuredImageUrl = text(form, "featuredImageUrl");
  validateOptionalUrl(featuredImageUrl, "Featured image");
  const category = text(form, "category");
  if (!(await database.collection("categories").findOne({ kind: "post", name: category }, { projection: { _id: 1 } }))) {
    throw new Error("Choose a valid post category.");
  }

  const relatedToolSlugs = uniqueList(form, "relatedToolSlugs", 12);
  await requireExistingSlugs(database, "tools", relatedToolSlugs, "Related tool");

  const document = {
    slug,
    title,
    summary: text(form, "summary").slice(0, 1000),
    content: text(form, "content").slice(0, 100_000),
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
      throw new Error("Another post already uses that slug.");
    }
    const result = await posts.updateOne({ slug: originalSlug }, { $set: document });
    if (!result.matchedCount) throw new Error("This post no longer exists. Refresh before saving again.");

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
      revalidatePath(`/news/${originalSlug}`);
    }
  } else {
    if (await posts.findOne({ slug }, { projection: { _id: 1 } })) throw new Error("Another post already uses that slug.");
    await posts.insertOne({ ...document, likes: 0 });
  }

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/tools");
  redirect("/admin/posts");
}

export async function deletePost(form: FormData) {
  await requireAdmin();
  const database = await db();
  const slug = text(form, "slug");
  if (!slug) throw new Error("Post is required.");

  const result = await database.collection("posts").deleteOne({ slug });
  if (result.deletedCount) {
    await Promise.all([
      pullStringReference(database, "tools", { relatedPostSlugs: slug }, "relatedPostSlugs", slug),
      pullStringReference(database, "collections", { postSlugs: slug }, "postSlugs", slug),
      pullStringReference(database, "user_preferences", { savedPosts: slug }, "savedPosts", slug),
      database.collection("comments").deleteMany({ postSlug: slug }),
      database.collection("engagement_reactions").deleteMany({ kind: "post-like", target: slug }),
    ]);
  }
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/news/${slug}`);
  redirect("/admin/posts");
}

export async function saveTool(form: FormData) {
  await requireAdmin();
  const database = await db();
  const tools = database.collection("tools");
  const originalSlug = text(form, "originalSlug");
  const name = text(form, "name").slice(0, 180);
  const slug = slugify(text(form, "slug") || name);
  if (!name || !slug) throw new Error("Tool name is required.");

  const website = text(form, "website");
  const github = text(form, "github");
  const logoUrl = text(form, "logoUrl");
  const screenshots = uniqueList(form, "screenshots", 8);
  validateOptionalUrl(website, "Website");
  validateOptionalUrl(github, "GitHub URL");
  validateOptionalUrl(logoUrl, "Logo URL");
  if (screenshots.some((url) => !validHttpUrl(url))) throw new Error("Screenshots must use valid http/https URLs.");

  const status = text(form, "status") === "published" ? "published" : "draft";
  if (status === "published" && !website) throw new Error("A website URL is required before publishing a tool.");

  const category = text(form, "category");
  if (!(await database.collection("categories").findOne({ kind: "tool", slug: category }, { projection: { _id: 1 } }))) {
    throw new Error("Choose a valid tool category.");
  }

  const alternatives = uniqueList(form, "alternatives", 8);
  if (alternatives.includes(slug) || (originalSlug && alternatives.includes(originalSlug))) {
    throw new Error("A tool cannot list itself as an alternative.");
  }
  const relatedPostSlugs = uniqueList(form, "relatedPostSlugs", 12);
  await Promise.all([
    requireExistingSlugs(database, "tools", alternatives, "Alternative tool"),
    requireExistingSlugs(database, "posts", relatedPostSlugs, "Related post"),
  ]);

  const pricing = ["free", "freemium", "paid", "open-source"].includes(text(form, "pricing")) ? text(form, "pricing") : "free";
  const document = {
    slug,
    name,
    tagline: text(form, "tagline").slice(0, 500),
    description: text(form, "description").slice(0, 20_000),
    website,
    github: github || undefined,
    logoUrl: logoUrl || undefined,
    screenshots,
    maker: text(form, "maker").slice(0, 160) || undefined,
    pricing,
    openSource: form.get("openSource") === "on",
    category,
    tags: uniqueList(form, "tags", 20).map((tag) => tag.slice(0, 100)),
    featured: form.get("featured") === "on",
    status,
    launchedAt: iso(text(form, "launchedAt")),
    updatedAt: new Date().toISOString(),
    bestFor: lines(form, "bestFor").slice(0, 12).map((item) => item.slice(0, 500)),
    notIdealFor: lines(form, "notIdealFor").slice(0, 12).map((item) => item.slice(0, 500)),
    strengths: lines(form, "strengths").slice(0, 12).map((item) => item.slice(0, 500)),
    tradeoffs: lines(form, "tradeoffs").slice(0, 12).map((item) => item.slice(0, 500)),
    verdict: text(form, "verdict").slice(0, 2400) || undefined,
    alternatives,
    relatedPostSlugs,
    launchBoard: form.get("launchBoard") === "on",
    launchNote: text(form, "launchNote").slice(0, 1000) || undefined,
  };

  if (originalSlug) {
    if (slug !== originalSlug && await tools.findOne({ slug }, { projection: { _id: 1 } })) {
      throw new Error("Another tool already uses that slug.");
    }
    const result = await tools.updateOne({ slug: originalSlug }, { $set: document });
    if (!result.matchedCount) throw new Error("This tool no longer exists. Refresh before saving again.");

    if (slug !== originalSlug) {
      await Promise.all([
        database.collection("posts").updateMany(
          { relatedToolSlugs: originalSlug },
          { $set: { "relatedToolSlugs.$[item]": slug } },
          { arrayFilters: [{ item: originalSlug }] },
        ),
        tools.updateMany(
          { alternatives: originalSlug },
          { $set: { "alternatives.$[item]": slug } },
          { arrayFilters: [{ item: originalSlug }] },
        ),
        database.collection("collections").updateMany(
          { toolSlugs: originalSlug },
          { $set: { "toolSlugs.$[item]": slug } },
          { arrayFilters: [{ item: originalSlug }] },
        ),
        database.collection("user_preferences").updateMany(
          { savedTools: originalSlug },
          { $set: { "savedTools.$[item]": slug } },
          { arrayFilters: [{ item: originalSlug }] },
        ),
        database.collection("tool_submissions").updateMany({ convertedToolSlug: originalSlug }, { $set: { convertedToolSlug: slug } }),
        database.collection("engagement_reactions").updateMany(
          { kind: "tool-upvote", target: originalSlug },
          { $set: { target: slug } },
        ),
      ]);
      revalidatePath(`/tools/${originalSlug}`);
    }
  } else {
    if (await tools.findOne({ slug }, { projection: { _id: 1 } })) throw new Error("Another tool already uses that slug.");
    await tools.insertOne({ ...document, upvotes: 0 });
  }

  revalidatePath("/tools");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/launches");
  revalidatePath("/");
  redirect("/admin/tools");
}

export async function deleteTool(form: FormData) {
  await requireAdmin();
  const database = await db();
  const slug = text(form, "slug");
  if (!slug) throw new Error("Tool is required.");

  const result = await database.collection("tools").deleteOne({ slug });
  if (result.deletedCount) {
    await Promise.all([
      pullStringReference(database, "posts", { relatedToolSlugs: slug }, "relatedToolSlugs", slug),
      pullStringReference(database, "tools", { alternatives: slug }, "alternatives", slug),
      pullStringReference(database, "collections", { toolSlugs: slug }, "toolSlugs", slug),
      pullStringReference(database, "user_preferences", { savedTools: slug }, "savedTools", slug),
      database.collection("engagement_reactions").deleteMany({ kind: "tool-upvote", target: slug }),
    ]);
  }
  revalidatePath("/tools");
  revalidatePath(`/tools/${slug}`);
  revalidatePath("/launches");
  revalidatePath("/");
  redirect("/admin/tools");
}
