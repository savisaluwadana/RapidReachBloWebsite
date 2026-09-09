import Link from "next/link";
import type { Tool } from "@/lib/types";
import { ToolUpvote } from "@/components/ToolUpvote";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="tool-card">
      <Link className="tool-card-main" href={`/tools/${tool.slug}`}>
        <div className="tool-logo" aria-hidden="true">{tool.logoUrl ? <img src={tool.logoUrl} alt="" /> : <span>{tool.name.slice(0, 1).toUpperCase()}</span>}</div>
        <div className="tool-card-copy">
          <div className="tool-card-top"><h3>{tool.name}</h3>{tool.featured && <span className="tool-featured">Featured</span>}</div>
          <p>{tool.tagline}</p>
          <div className="tool-meta"><span>{tool.pricing === "open-source" ? "Open source" : tool.pricing}</span>{tool.openSource && tool.pricing !== "open-source" && <span>Open source</span>}<span>{tool.tags.slice(0, 2).join(" · ")}</span></div>
        </div>
      </Link>
      <ToolUpvote slug={tool.slug} initialUpvotes={tool.upvotes} />
    </article>
  );
}
