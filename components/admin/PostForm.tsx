"use client";

import { useActionState } from "react";
import type { Category, Post } from "@/lib/types";
import { savePostWithFeedback, type PostSaveState } from "@/app/admin/post-actions";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { RichArticleEditor } from "@/components/admin/RichArticleEditor";

const initialState: PostSaveState = { error: "" };

export function PostForm({ post, categories }: { post?: Post | null; categories: Category[] }) {
  const [state, formAction, pending] = useActionState(savePostWithFeedback, initialState);
  const hasCategories = categories.length > 0;
  const sourcesValue = post?.sources?.map((source) => `${source.title} | ${source.url}`).join("\n") || "";
  const correctionsValue = post?.corrections?.map((correction) => `${correction.date} | ${correction.note}`).join("\n") || "";

  return (
    <form action={formAction} className="cms-editor">
      {post && <input type="hidden" name="originalSlug" value={post.slug} />}
      <div className="cms-form-grid two"><label>Title<input name="title" required defaultValue={post?.title} placeholder="Article title" /></label><label>Slug<input name="slug" defaultValue={post?.slug} placeholder="generated-from-title" /></label></div>
      <label>Summary<textarea name="summary" required rows={3} defaultValue={post?.summary} placeholder="Clear answer-first summary for readers and search engines." /></label>
      <MediaUploader inputName="featuredImageUrl" label="Header / cover image" kind="post-featured" initialUrls={post?.featuredImageUrl ? [post.featuredImageUrl] : []} help="The main article image used in the story header, social previews, and story cards." />
      <div className="cms-form-grid three"><label>Category<select name="category" required disabled={!hasCategories} defaultValue={post?.category || categories[0]?.name}>{hasCategories ? categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>) : <option value="">No post categories available</option>}</select>{!hasCategories && <small>Create a post category before saving an article.</small>}</label><label>Author<input name="author" defaultValue={post?.author || "RapidReach Editorial"} /></label><label>Reading minutes<input name="readingMinutes" type="number" min="1" max="180" defaultValue={post?.readingMinutes || 4} /></label></div>
      <div className="cms-form-grid two"><label>Publish date<input name="publishedAt" type="datetime-local" defaultValue={(post?.publishedAt || new Date().toISOString()).slice(0, 16)} /></label><label>Status<select name="status" defaultValue={post?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <label>Tags<input name="tags" defaultValue={post?.tags.join(", ")} placeholder="kubernetes, devtools, open source" /></label>
      <label>Related tool slugs<input name="relatedToolSlugs" defaultValue={post?.relatedToolSlugs?.join(", ")} placeholder="openchoreo, opentelemetry" /><small>These tools appear directly below the article as related software.</small></label>
      <label>Key takeaways<textarea name="keyTakeaways" rows={4} defaultValue={post?.keyTakeaways.join("\n")} placeholder="One takeaway per line" /></label>
      <label>Sources<textarea name="sources" rows={5} defaultValue={sourcesValue} placeholder="Kubernetes docs | https://kubernetes.io/docs/..." /><small>One source per line using: source title | https://source-url</small></label>
      <label>Corrections / update notes<textarea name="corrections" rows={4} defaultValue={correctionsValue} placeholder="2026-09-13 | Clarified the deployment behavior after upstream documentation changed." /><small>One entry per line using: YYYY-MM-DD | correction or material update note.</small></label>
      <RichArticleEditor initialContent={post?.content || ""} />
      {state.error && <div className="cms-warning" role="alert"><strong>Couldn’t save this post.</strong><br />{state.error}</div>}
      <div className="cms-editor-actions"><button className="cms-primary" type="submit" disabled={pending || !hasCategories}>{pending ? "Saving…" : post ? "Save changes" : "Create post"}</button><a className="cms-secondary" href="/admin/posts">Cancel</a></div>
    </form>
  );
}
