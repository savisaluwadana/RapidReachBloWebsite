import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate, isoDate } from "@/lib/public-format";

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date) + " UTC";
}

export function SignalDesk({ posts, fullPage = false }: { posts: Post[]; fullPage?: boolean }) {
  if (!posts.length) return null;

  const [lead, ...stream] = posts.slice(0, 7);
  const leadIso = isoDate(lead.publishedAt);
  const leadTags = new Set(lead.tags.map((tag) => tag.toLowerCase()));
  const related = posts
    .filter((post) => post.slug !== lead.slug)
    .filter((post) => post.category === lead.category || post.tags.some((tag) => leadTags.has(tag.toLowerCase())))
    .slice(0, 3);

  return (
    <section className="signal-desk shell" id="signal-desk" aria-labelledby="signal-desk-title">
      <div className="signal-desk-heading">
        <div>
          <span className="section-kicker">RapidReach Signal Desk</span>
          <h2 id="signal-desk-title">What is moving right now.</h2>
        </div>
        <div className="signal-live"><i aria-hidden="true" /> Updated from the latest published stories</div>
      </div>

      <div className="signal-board">
        <article className="signal-lead">
          <div className="signal-meta">
            <span>Top signal</span>
            <Link href={`/category/${encodeURIComponent(lead.category)}`}>{lead.category}</Link>
            <time dateTime={leadIso}>{timeLabel(lead.publishedAt)}</time>
          </div>
          <h3><Link href={`/news/${lead.slug}`}>{lead.title}</Link></h3>
          <p>{lead.summary}</p>
          <div className="signal-lead-footer">
            <span>{lead.readingMinutes} min analysis · {lead.author}</span>
            <Link href={`/news/${lead.slug}`}>Read the analysis ↗</Link>
          </div>

          {related.length > 0 && (
            <div className="signal-context">
              <span>Related context</span>
              {related.map((post) => <Link key={post.slug} href={`/news/${post.slug}`}>{post.title}</Link>)}
            </div>
          )}
        </article>

        <div className="signal-stream" aria-label="Latest RapidReach signals">
          <div className="signal-stream-head"><span>Rapid stream</span><span>{stream.length} signals</span></div>
          {stream.map((post, index) => (
            <article className="signal-row" key={post.slug}>
              <span className="signal-rank">{String(index + 2).padStart(2, "0")}</span>
              <div>
                <div className="signal-row-meta"><Link href={`/category/${encodeURIComponent(post.category)}`}>{post.category}</Link><span>·</span><time dateTime={isoDate(post.publishedAt)}>{timeLabel(post.publishedAt)}</time></div>
                <h3><Link href={`/news/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.summary}</p>
              </div>
            </article>
          ))}
          <div className="signal-stream-footer">
            <Link href={fullPage ? "/briefing" : "/signals"}>{fullPage ? "Read the RapidReach Brief →" : "Open the full Signal Desk →"}</Link>
            <Link href="/search">Search the archive ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
