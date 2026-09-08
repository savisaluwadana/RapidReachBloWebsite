import Link from "next/link";
import type { Post } from "@/lib/types";

export function ArticleCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article className={compact ? "article-card compact" : "article-card"}>
      <div className="card-topline">
        <div className="eyebrow">
          <Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link>
          <span>•</span>
          <time dateTime={post.publishedAt}>
            {new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.publishedAt))}
          </time>
        </div>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </div>

      <h3><Link href={`/news/${post.slug}`}>{post.title}</Link></h3>
      <p>{post.summary}</p>

      <div className="card-meta">
        <span>{post.readingMinutes} min read</span>
        <span>By {post.author}</span>
      </div>
    </article>
  );
}
