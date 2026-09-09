import type { Category, Post } from "@/lib/types";
import { savePost } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";

export function PostForm({ post, categories }: { post?: Post | null; categories: Category[] }) {
  return (
    <form action={savePost} className="cms-editor">
      {post && <input type="hidden" name="originalSlug" value={post.slug} />}
      <div className="cms-form-grid two"><label>Title<input name="title" required defaultValue={post?.title} placeholder="Article title" /></label><label>Slug<input name="slug" defaultValue={post?.slug} placeholder="generated-from-title" /></label></div>
      <label>Summary<textarea name="summary" required rows={3} defaultValue={post?.summary} placeholder="Clear answer-first summary for readers and search engines." /></label>
      <MediaUploader inputName="featuredImageUrl" label="Featured image" kind="post-featured" initialUrls={post?.featuredImageUrl ? [post.featuredImageUrl] : []} help="Used on the article page, social metadata, and story cards when available." />
      <div className="cms-form-grid three"><label>Category<select name="category" required defaultValue={post?.category || categories[0]?.name}>{categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>)}</select></label><label>Author<input name="author" defaultValue={post?.author || "RapidReach Editorial"} /></label><label>Reading minutes<input name="readingMinutes" type="number" min="1" defaultValue={post?.readingMinutes || 4} /></label></div>
      <div className="cms-form-grid two"><label>Publish date<input name="publishedAt" type="datetime-local" defaultValue={(post?.publishedAt || new Date().toISOString()).slice(0, 16)} /></label><label>Status<select name="status" defaultValue={post?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <label>Tags<input name="tags" defaultValue={post?.tags.join(", ")} placeholder="kubernetes, devtools, open source" /></label>
      <label>Related tool slugs<input name="relatedToolSlugs" defaultValue={post?.relatedToolSlugs?.join(", ")} placeholder="openchoreo, opentelemetry" /><small>These tools appear directly below the article as related software.</small></label>
      <label>Key takeaways<textarea name="keyTakeaways" rows={4} defaultValue={post?.keyTakeaways.join("\n")} placeholder="One takeaway per line" /></label>
      <label>Article body<textarea className="cms-content-editor" name="content" required rows={20} defaultValue={post?.content} placeholder="Write in plain text. Separate paragraphs with blank lines." /></label>
      <div className="cms-editor-actions"><button className="cms-primary" type="submit">{post ? "Save changes" : "Create post"}</button><a className="cms-secondary" href="/admin/posts">Cancel</a></div>
    </form>
  );
}
