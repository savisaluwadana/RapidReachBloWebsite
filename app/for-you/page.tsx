import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { requireUser } from "@/lib/auth";
import { getPosts } from "@/lib/posts";
import { getPreferences } from "@/lib/preferences";
import { rankPostsForTopics } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "For You",
  description: "A personalized RapidReach feed based on the topics you follow.",
  robots: { index: false, follow: false },
};

export default async function ForYouPage() {
  const user = await requireUser();
  const [posts, preferences] = await Promise.all([getPosts(), getPreferences(user.id)]);
  const ranked = rankPostsForTopics(posts, preferences.followedTopics);
  const personalized = preferences.followedTopics.length > 0;

  return (
    <section className="shell archive-page">
      <header className="archive-header">
        <span className="section-kicker">Your RapidReach</span>
        <h1>For You</h1>
        <p>{personalized
          ? `Prioritized around ${preferences.followedTopics.join(", ")}. Follow or unfollow topics from any article to tune this feed.`
          : "Follow topics from article pages and RapidReach will prioritize those signals here."}</p>
        <div className="tag-row">
          {preferences.followedTopics.map((topic) => <Link key={topic} href={`/category/${encodeURIComponent(topic)}`}>{topic}</Link>)}
        </div>
      </header>
      <div className="article-grid">{ranked.slice(0, 24).map((post) => <ArticleCard key={post.slug} post={post} />)}</div>
      {ranked.length === 0 && <p className="empty-state">No published stories are available yet.</p>}
    </section>
  );
}
