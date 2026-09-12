import Link from "next/link";
import { formatDate, isoDate } from "@/lib/public-format";
import type { Post } from "@/lib/types";

export function ArticleCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const publishedIso = isoDate(post.publishedAt);
  return (
    <article className={compact ? "article-card compact" : "article-card"}>
      {post.featuredImageUrl && (
        <Link className="article-card-media" href={`/news/${post.slug}`} aria-label={`Read ${post.title}`}>
          <img src={post.featuredImageUrl} alt="" loading="lazy" />
        </Link>
      )}

      <div className="card-topline">
        <div className="eyebrow">
          <Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link>
          <span>•</span>
          <time dateTime={publishedIso}>
            {formatDate(post.publishedAt, { month: "short", day: "numeric", year: "numeric" })}
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
