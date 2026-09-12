import type { Metadata } from "next";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { getPosts } from "@/lib/posts";
import { getTools } from "@/lib/tools";

export const metadata: Metadata = { title: "Weekly Developer Briefing", description: "Five developer stories and five tools worth knowing each week. No infinite feed, no daily spam.", alternates: { canonical: "/briefing" } };
export const revalidate = 60;

export default async function BriefingPage({ searchParams }: { searchParams: Promise<{ unsubscribed?: string; resubscribed?: string; subscription?: string }> }) {
  const [posts, tools] = await Promise.all([getPosts(), getTools()]);
  const { unsubscribed, resubscribed, subscription } = await searchParams;
  return <main className="briefing-page shell"><header className="briefing-hero"><span className="section-kicker">RapidReach weekly briefing</span><h1>Five stories. Five tools. One useful email.</h1><p>A weekly developer intelligence brief for people who build software. We filter the launches, platform shifts, open-source changes, and tools so you do not have to live in an infinite feed.</p><NewsletterSignup />{unsubscribed === "1" && <p className="newsletter-success">You have been unsubscribed.</p>}{resubscribed === "1" && <p className="newsletter-success">You are subscribed to the weekly briefing again.</p>}{subscription === "error" && <p className="newsletter-error">That subscription change could not be completed. Please use the latest link from a RapidReach email.</p>}</header><section className="briefing-preview"><div><span className="section-kicker">This week’s shape</span><h2>What you’ll get</h2></div><div className="briefing-columns"><div><strong>05 / Stories</strong>{posts.slice(0,5).map((post) => <span key={post.slug}>{post.title}</span>)}</div><div><strong>05 / Tools</strong>{tools.slice(0,5).map((tool) => <span key={tool.slug}>{tool.name} — {tool.tagline}</span>)}</div></div></section><section className="briefing-principles"><p><strong>No daily spam.</strong> One briefing per week.</p><p><strong>No paid ranking.</strong> Editorial relevance determines what appears.</p><p><strong>Easy exit.</strong> Every email contains a subscription-management link.</p></section></main>;
}
