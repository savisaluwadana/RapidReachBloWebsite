import type { Metadata } from "next";
import Link from "next/link";
import { PreferenceButton } from "@/components/PreferenceButton";
import { getTools } from "@/lib/tools";

export const metadata: Metadata = { title: "Developer Tools This Week", description: "RapidReach weekly launch board: developer tools and releases worth watching, with concise editorial context.", alternates: { canonical: "/launches" } };
export const revalidate = 60;

export default async function LaunchBoardPage() {
  const tools = await getTools();
  const selected = tools.filter((tool) => tool.launchBoard).slice(0, 10);
  const board = selected.length ? selected : [...tools].sort((a,b) => +new Date(b.launchedAt) - +new Date(a.launchedAt)).slice(0, 8);
  const week = new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
  return <main className="launch-page shell"><header className="launch-hero"><div><span className="section-kicker">Weekly launch board / {week}</span><h1>Developer tools worth watching this week.</h1><p>Not every launch deserves another feed item. These are the products, releases, and infrastructure shifts RapidReach thinks are worth a closer look.</p></div><Link className="account-secondary" href="/briefing">Get the weekly briefing</Link></header><div className="launch-board">{board.map((tool, index) => <article className="launch-row" key={tool.slug}><div className="launch-rank">{String(index + 1).padStart(2,"0")}</div><div className="launch-logo">{tool.logoUrl ? <img src={tool.logoUrl} alt=""/> : tool.name.slice(0,1)}</div><div className="launch-copy"><div><Link href={`/tools/${tool.slug}`}>{tool.name}</Link><span>{tool.openSource ? "Open source" : tool.pricing}</span></div><p>{tool.launchNote || tool.verdict || tool.tagline}</p><small>{tool.tags.slice(0,3).join(" · ")}</small></div><div className="launch-actions"><PreferenceButton kind="tool" value={tool.slug} label="Save" savedLabel="Saved ✓" className="launch-save"/><Link href={`/tools/${tool.slug}`}>View tool ↗</Link></div></article>)}</div></main>;
}
