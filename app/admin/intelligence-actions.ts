"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, hasDatabase } from "@/lib/mongodb";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

function text(form: FormData, key: string) { return String(form.get(key) || "").trim(); }
function list(form: FormData, key: string) { return text(form, key).split(",").map((item) => item.trim()).filter(Boolean); }
function uniqueList(form: FormData, key: string, limit: number) { return [...new Set(list(form, key))].slice(0, limit); }
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
async function db() { if (!hasDatabase()) throw new Error("MongoDB must be configured before using editorial intelligence features."); return getDb(); }

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

export async function saveCollection(form: FormData) {
  await requireAdmin();
  const database = await db();
  const collections = database.collection("collections");
  const title = text(form, "title").slice(0, 240);
  const originalSlug = text(form, "originalSlug");
  const slug = slugify(text(form, "slug") || title);
  if (!title || !slug) throw new Error("Collection title is required.");

  const toolSlugs = uniqueList(form, "toolSlugs", 30);
  const postSlugs = uniqueList(form, "postSlugs", 30);
  await Promise.all([
    requireExistingSlugs(database, "tools", toolSlugs, "Collection tool"),
    requireExistingSlugs(database, "posts", postSlugs, "Collection post"),
  ]);

  const now = new Date().toISOString();
  const document = {
    slug,
    title,
    description: text(form, "description").slice(0, 2000),
    toolSlugs,
    postSlugs,
    featured: form.get("featured") === "on",
    status: text(form, "status") === "published" ? "published" : "draft",
    updatedAt: now,
  };

  if (originalSlug) {
    if (slug !== originalSlug && await collections.findOne({ slug }, { projection: { _id: 1 } })) {
      throw new Error("Another collection already uses that slug.");
    }
    const result = await collections.updateOne({ slug: originalSlug }, { $set: document });
    if (!result.matchedCount) throw new Error("This collection no longer exists. Refresh before saving again.");
    if (slug !== originalSlug) revalidatePath(`/collections/${originalSlug}`);
  } else {
    if (await collections.findOne({ slug }, { projection: { _id: 1 } })) {
      throw new Error("Another collection already uses that slug.");
    }
    await collections.insertOne({ ...document, createdAt: now });
  }

  revalidatePath("/collections");
  revalidatePath(`/collections/${slug}`);
  revalidatePath("/tools");
  redirect("/admin/collections");
}

export async function deleteCollection(form: FormData) {
  await requireAdmin();
  const database = await db();
  const slug = text(form, "slug");
  if (!slug) throw new Error("Collection is required.");
  await database.collection("collections").deleteOne({ slug });
  revalidatePath("/collections");
  revalidatePath(`/collections/${slug}`);
  revalidatePath("/tools");
  redirect("/admin/collections");
}

function esc(value: string) { return value.replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char] || char)); }

export async function sendWeeklyBriefing(form: FormData) {
  await requireAdmin();
  const database = await db();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BRIEFING_FROM_EMAIL;
  if (!apiKey || !from) redirect("/admin/briefing?error=config");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev").replace(/\/$/, "");
  const subject = text(form, "subject").slice(0, 200) || "RapidReach Weekly Developer Briefing";
  const intro = text(form, "intro").slice(0, 4000);
  const postSlugs = uniqueList(form, "postSlugs", 5);
  const toolSlugs = uniqueList(form, "toolSlugs", 5);
  const [posts, tools] = await Promise.all([getPosts(), getTools()]);
  const selectedPosts = (postSlugs.length ? postSlugs.map((slug) => posts.find((item) => item.slug === slug)).filter(Boolean) : posts.slice(0, 5)) as typeof posts;
  const selectedTools = (toolSlugs.length ? toolSlugs.map((slug) => tools.find((item) => item.slug === slug)).filter(Boolean) : tools.slice(0, 5)) as typeof tools;
  if (postSlugs.length && selectedPosts.length !== postSlugs.length) throw new Error("One or more selected briefing posts no longer exist.");
  if (toolSlugs.length && selectedTools.length !== toolSlugs.length) throw new Error("One or more selected briefing tools no longer exist.");

  const subscribers = await database.collection("newsletter_subscribers")
    .find({ status: "active", email: { $type: "string" }, unsubscribeToken: { $type: "string" } })
    .toArray();
  if (!subscribers.length) redirect("/admin/briefing?error=no-subscribers");

  const content = `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.08em">RapidReach / Weekly Developer Briefing</p><h1>${esc(subject)}</h1><p>${esc(intro || "The developer stories and tools worth your attention this week.")}</p><h2>Stories</h2>${selectedPosts.map((post) => `<p><a href="${siteUrl}/news/${encodeURIComponent(post.slug)}"><strong>${esc(post.title)}</strong></a><br/>${esc(post.summary)}</p>`).join("")}<h2>Tools</h2>${selectedTools.map((tool) => `<p><a href="${siteUrl}/tools/${encodeURIComponent(tool.slug)}"><strong>${esc(tool.name)}</strong></a><br/>${esc(tool.verdict || tool.tagline)}</p>`).join("")}<p style="margin-top:40px;color:#666">Signal over volume. RapidReach.</p></div>`;

  for (let start = 0; start < subscribers.length; start += 100) {
    const batch = subscribers.slice(start, start + 100).map((subscriber) => ({
      from,
      to: [String(subscriber.email)],
      subject,
      html: content.replace("</div>", `<p style="font-size:11px"><a href="${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(String(subscriber.unsubscribeToken))}">Unsubscribe</a></p></div>`),
    }));
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "user-agent": "RapidReach/1.0" },
      body: JSON.stringify(batch),
    });
    if (!response.ok) throw new Error(`Briefing delivery failed: ${response.status}`);
  }

  await database.collection("briefing_sends").insertOne({
    subject,
    intro,
    postSlugs: selectedPosts.map((item) => item.slug),
    toolSlugs: selectedTools.map((item) => item.slug),
    recipients: subscribers.length,
    sentAt: new Date().toISOString(),
  });
  redirect(`/admin/briefing?sent=${subscribers.length}`);
}
