"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";

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
  if (Number.isNaN(date.getTime())) throw new Error("Enter a valid launch date and time.");
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

function validHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
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

export async function saveTool(form: FormData) {
  await requireAdmin();
  const database = await getDb();
  const tools = database.collection("tools");
  const originalSlug = text(form, "originalSlug");
  const name = text(form, "name").slice(0, 180);
  const slug = slugify(text(form, "slug") || name);
  if (!name || !slug) throw new Error("Tool name is required.");

  const website = text(form, "website");
  const github = text(form, "github");
  const logoUrl = text(form, "logoUrl");
  const screenshots = uniqueList(form, "screenshots", 8);
  if (website && !validHttpUrl(website)) throw new Error("Website must be a valid http/https URL.");
  if (github && !validHttpUrl(github)) throw new Error("GitHub URL must be a valid http/https URL.");
  if (logoUrl && !validHttpsUrl(logoUrl)) throw new Error("Logo URL must use HTTPS.");
  if (screenshots.some((url) => !validHttpsUrl(url))) throw new Error("Screenshots must use HTTPS URLs.");

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
  revalidatePath("/dashboard");
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
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
