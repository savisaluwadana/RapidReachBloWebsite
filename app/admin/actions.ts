"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, logoutUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, hasDatabase } from "@/lib/mongodb";

function text(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function list(form: FormData, key: string) { return text(form, key).split(",").map((item) => item.trim()).filter(Boolean); }
function lines(form: FormData, key: string) { return text(form, key).split("\n").map((item) => item.trim()).filter(Boolean); }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function iso(value: string) { const date = value ? new Date(value) : new Date(); return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(); }
async function db() { if (!hasDatabase()) throw new Error("MongoDB must be configured before using the CMS."); return getDb(); }

export async function loginAdmin(form: FormData) { const result = await loginUser({ email: text(form, "email"), password: text(form, "password"), requireRole: "admin" }); if (!result.ok) redirect(`/admin/login?error=${encodeURIComponent(result.error)}`); redirect("/admin"); }
export async function logoutAdmin() { await logoutUser(); redirect("/admin/login"); }

export async function saveCategory(form: FormData) {
  await requireAdmin(); const database = await db(); const name = text(form, "name"); const kind = text(form, "kind") === "tool" ? "tool" : "post"; const originalSlug = text(form, "originalSlug"); const originalName = text(form, "originalName"); const slug = slugify(text(form, "slug") || name); if (!name || !slug) throw new Error("Category name is required.");
  await database.collection("categories").updateOne({ slug: originalSlug || slug, kind }, { $set: { name, slug, kind, description: text(form, "description"), updatedAt: new Date().toISOString() }, $setOnInsert: { createdAt: new Date().toISOString() } }, { upsert: true });
  if (kind === "post" && originalName && originalName !== name) await database.collection("posts").updateMany({ category: originalName }, { $set: { category: name } });
  if (kind === "tool" && originalSlug && originalSlug !== slug) await database.collection("tools").updateMany({ category: originalSlug }, { $set: { category: slug } });
  revalidatePath("/"); revalidatePath("/tools"); revalidatePath("/admin/categories");
}

export async function deleteCategory(form: FormData) { await requireAdmin(); const database = await db(); await database.collection("categories").deleteOne({ slug: text(form, "slug"), kind: text(form, "kind") }); revalidatePath("/"); revalidatePath("/tools"); revalidatePath("/admin/categories"); }

export async function savePost(form: FormData) {
  await requireAdmin(); const database = await db(); const originalSlug = text(form, "originalSlug"); const title = text(form, "title"); const slug = slugify(text(form, "slug") || title); if (!title || !slug) throw new Error("Post title is required.");
  const document = { slug, title, summary: text(form, "summary"), content: text(form, "content"), category: text(form, "category"), author: text(form, "author") || "RapidReach Editorial", publishedAt: iso(text(form, "publishedAt")), updatedAt: new Date().toISOString(), featuredImageUrl: text(form, "featuredImageUrl") || undefined, readingMinutes: Math.max(1, Number(text(form, "readingMinutes") || 4)), tags: list(form, "tags").slice(0, 20), keyTakeaways: lines(form, "keyTakeaways").slice(0, 12), relatedToolSlugs: list(form, "relatedToolSlugs").slice(0, 12), status: text(form, "status") === "published" ? "published" : "draft" };
  await database.collection("posts").updateOne({ slug: originalSlug || slug }, { $set: document, $setOnInsert: { likes: 0 } }, { upsert: true }); revalidatePath("/"); revalidatePath("/search"); revalidatePath(`/news/${slug}`); revalidatePath("/tools"); redirect("/admin/posts");
}

export async function deletePost(form: FormData) { await requireAdmin(); const database = await db(); const slug = text(form, "slug"); await database.collection("posts").deleteOne({ slug }); revalidatePath("/"); revalidatePath("/search"); redirect("/admin/posts"); }

export async function saveTool(form: FormData) {
  await requireAdmin(); const database = await db(); const originalSlug = text(form, "originalSlug"); const name = text(form, "name"); const slug = slugify(text(form, "slug") || name); if (!name || !slug) throw new Error("Tool name is required.");
  const pricing = ["free", "freemium", "paid", "open-source"].includes(text(form, "pricing")) ? text(form, "pricing") : "free";
  const document = { slug, name, tagline: text(form, "tagline"), description: text(form, "description"), website: text(form, "website"), github: text(form, "github") || undefined, logoUrl: text(form, "logoUrl") || undefined, screenshots: list(form, "screenshots").slice(0, 8), maker: text(form, "maker") || undefined, pricing, openSource: form.get("openSource") === "on", category: text(form, "category"), tags: list(form, "tags").slice(0, 20), featured: form.get("featured") === "on", status: text(form, "status") === "published" ? "published" : "draft", launchedAt: iso(text(form, "launchedAt")), updatedAt: new Date().toISOString(), bestFor: lines(form, "bestFor").slice(0, 12), notIdealFor: lines(form, "notIdealFor").slice(0, 12), strengths: lines(form, "strengths").slice(0, 12), tradeoffs: lines(form, "tradeoffs").slice(0, 12), verdict: text(form, "verdict").slice(0, 2400) || undefined, alternatives: list(form, "alternatives").slice(0, 8), relatedPostSlugs: list(form, "relatedPostSlugs").slice(0, 12), launchBoard: form.get("launchBoard") === "on", launchNote: text(form, "launchNote").slice(0, 1000) || undefined };
  await database.collection("tools").updateOne({ slug: originalSlug || slug }, { $set: document, $setOnInsert: { upvotes: 0 } }, { upsert: true }); revalidatePath("/tools"); revalidatePath(`/tools/${slug}`); revalidatePath("/launches"); revalidatePath("/"); redirect("/admin/tools");
}

export async function deleteTool(form: FormData) { await requireAdmin(); const database = await db(); const slug = text(form, "slug"); await database.collection("tools").deleteOne({ slug }); revalidatePath("/tools"); revalidatePath("/launches"); revalidatePath("/"); redirect("/admin/tools"); }
