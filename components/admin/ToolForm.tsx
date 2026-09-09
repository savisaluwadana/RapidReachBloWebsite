import type { Category, Tool } from "@/lib/types";
import { saveTool } from "@/app/admin/actions";
import { MediaUploader } from "@/components/admin/MediaUploader";

const lines = (items?: string[]) => items?.join("\n") || "";

export function ToolForm({ tool, categories }: { tool?: Tool | null; categories: Category[] }) {
  return (
    <form action={saveTool} className="cms-editor">
      {tool && <input type="hidden" name="originalSlug" value={tool.slug} />}
      <div className="cms-form-grid two"><label>Tool name<input name="name" required defaultValue={tool?.name} placeholder="Acme DevTool" /></label><label>Slug<input name="slug" defaultValue={tool?.slug} placeholder="generated-from-name" /></label></div>
      <label>Tagline<input name="tagline" required defaultValue={tool?.tagline} placeholder="One sharp sentence explaining why developers should care." /></label>
      <label>Full description<textarea name="description" required rows={8} defaultValue={tool?.description} placeholder="Explain what the product does, who it is for, and why it is useful." /></label>
      <MediaUploader inputName="logoUrl" label="Tool logo" kind="tool-logo" initialUrls={tool?.logoUrl ? [tool.logoUrl] : []} help="Upload a square PNG/WebP logo, or paste an existing public logo URL." />
      <MediaUploader inputName="screenshots" label="Product screenshots" kind="tool-screenshot" initialUrls={tool?.screenshots || []} multiple help="Add up to 8 UI screenshots for the public tool profile." />
      <div className="cms-form-grid two"><label>Website<input name="website" type="url" required defaultValue={tool?.website} placeholder="https://example.com" /></label><label>GitHub URL<input name="github" type="url" defaultValue={tool?.github} placeholder="https://github.com/..." /></label></div>
      <label>Maker / company<input name="maker" defaultValue={tool?.maker} placeholder="Company or community" /></label>
      <div className="cms-form-grid three"><label>Category<select name="category" required defaultValue={tool?.category || categories[0]?.slug}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label><label>Pricing<select name="pricing" defaultValue={tool?.pricing || "free"}><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option><option value="open-source">Open source</option></select></label><label>Status<select name="status" defaultValue={tool?.status || "draft"}><option value="draft">Draft</option><option value="published">Published</option></select></label></div>
      <div className="cms-form-grid two"><label>Launch date<input name="launchedAt" type="datetime-local" defaultValue={(tool?.launchedAt || new Date().toISOString()).slice(0, 16)} /></label><label>Tags<input name="tags" defaultValue={tool?.tags.join(", ")} placeholder="kubernetes, ai, ci/cd" /></label></div>

      <section className="cms-editorial-block"><div><span className="section-kicker">Editorial intelligence</span><h3>Decision context</h3></div><label>RapidReach verdict<textarea name="verdict" rows={4} defaultValue={tool?.verdict} placeholder="The concise editorial take: when this is a strong choice and what to understand before adopting it." /></label><div className="cms-form-grid two"><label>Best for<textarea name="bestFor" rows={5} defaultValue={lines(tool?.bestFor)} placeholder="One use case or team profile per line" /></label><label>Not ideal for<textarea name="notIdealFor" rows={5} defaultValue={lines(tool?.notIdealFor)} placeholder="One constraint or poor-fit profile per line" /></label></div><div className="cms-form-grid two"><label>Strengths<textarea name="strengths" rows={5} defaultValue={lines(tool?.strengths)} placeholder="One strength per line" /></label><label>Trade-offs<textarea name="tradeoffs" rows={5} defaultValue={lines(tool?.tradeoffs)} placeholder="One trade-off per line" /></label></div><div className="cms-form-grid two"><label>Alternative tool slugs<input name="alternatives" defaultValue={tool?.alternatives?.join(", ")} placeholder="backstage, harness, port" /></label><label>Related post slugs<input name="relatedPostSlugs" defaultValue={tool?.relatedPostSlugs?.join(", ")} placeholder="article-slug-one, article-slug-two" /></label></div></section>

      <section className="cms-editorial-block"><div><span className="section-kicker">Launch board</span><h3>Weekly signal</h3></div><label>Launch-board note<textarea name="launchNote" rows={3} defaultValue={tool?.launchNote} placeholder="Why this tool or release is worth watching this week." /></label><div className="cms-check-row"><label className="cms-check"><input name="launchBoard" type="checkbox" defaultChecked={tool?.launchBoard} /> Include on launch board</label></div></section>

      <div className="cms-check-row"><label className="cms-check"><input name="openSource" type="checkbox" defaultChecked={tool?.openSource} /> Open source</label><label className="cms-check"><input name="featured" type="checkbox" defaultChecked={tool?.featured} /> Feature on directory</label></div>
      <div className="cms-editor-actions"><button className="cms-primary" type="submit">{tool ? "Save changes" : "Add tool"}</button><a className="cms-secondary" href="/admin/tools">Cancel</a></div>
    </form>
  );
}
