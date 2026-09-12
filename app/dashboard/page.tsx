import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserSubmissions } from "@/lib/submissions";
import { getPreferences } from "@/lib/preferences";
import { getTools } from "@/lib/tools";
import { getPosts } from "@/lib/posts";
import { logoutAccount, updateProfile } from "@/app/account-actions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { pending: "Pending review", in_review: "In review", changes_requested: "Changes requested", approved: "Approved", rejected: "Rejected" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ submitted?: string; profile?: string }> }) {
  const user = await requireUser();
  const [submissions, preferences, tools, posts] = await Promise.all([getUserSubmissions(user.id), getPreferences(user.id), getTools(), getPosts()]);
  const { submitted, profile } = await searchParams;
  const openCount = submissions.filter((item) => ["pending", "in_review", "changes_requested"].includes(item.status)).length;
  const publishedToolSlugs = new Set(tools.map((tool) => tool.slug));
  const savedTools = preferences.savedTools.map((slug) => tools.find((item) => item.slug === slug)).filter(Boolean) as typeof tools;
  const savedPosts = preferences.savedPosts.map((slug) => posts.find((item) => item.slug === slug)).filter(Boolean) as typeof posts;
  return (
    <section className="account-dashboard shell">
      <header className="account-dashboard-head"><div><span className="section-kicker">Your RapidReach</span><h1>Dashboard</h1><p>Welcome back, {user.name}. Keep the tools, stories, and topics you care about in one signal desk.</p></div><div className="account-dashboard-actions"><Link className="account-primary" href="/submit-tool">Submit a tool</Link>{user.role === "admin" && <Link className="account-secondary" href="/admin">Open CMS</Link>}</div></header>
      {submitted && <div className="account-success">Your tool was submitted for editorial review.</div>}{profile === "updated" && <div className="account-success">Profile updated.</div>}
      <div className="account-stat-grid"><div><strong>{savedTools.length}</strong><span>Saved tools</span></div><div><strong>{savedPosts.length}</strong><span>Saved stories</span></div><div><strong>{preferences.followedTopics.length}</strong><span>Followed topics</span></div><div><strong>{openCount}</strong><span>Open submissions</span></div></div>

      <div className="saved-intelligence-grid">
        <section className="account-panel"><div className="account-panel-head"><div><span className="section-kicker">Saved tools</span><h2>Your shortlist</h2></div><Link href="/tools">Discover ↗</Link></div>{savedTools.length ? <div className="saved-link-list">{savedTools.map((tool) => <Link href={`/tools/${tool.slug}`} key={tool.slug}><strong>{tool.name}</strong><span>{tool.tagline}</span></Link>)}</div> : <p className="account-fineprint">Save tools from the directory to build a shortlist here.</p>}</section>
        <section className="account-panel"><div className="account-panel-head"><div><span className="section-kicker">Saved stories</span><h2>Reading list</h2></div><Link href="/#latest">Read more ↗</Link></div>{savedPosts.length ? <div className="saved-link-list">{savedPosts.map((post) => <Link href={`/news/${post.slug}`} key={post.slug}><strong>{post.title}</strong><span>{post.category}</span></Link>)}</div> : <p className="account-fineprint">Save stories you want to return to.</p>}</section>
      </div>

      <section className="followed-topics"><span className="section-kicker">Followed topics</span><div>{preferences.followedTopics.length ? preferences.followedTopics.map((topic) => <Link href={`/category/${encodeURIComponent(topic)}`} key={topic}>{topic}</Link>) : <span>No followed topics yet.</span>}</div></section>

      <div className="account-dashboard-grid"><section className="account-panel"><div className="account-panel-head"><div><span className="section-kicker">Tool requests</span><h2>My submissions</h2></div><Link href="/submit-tool">New submission ↗</Link></div>{submissions.length ? <div className="submission-list">{submissions.map((submission) => <article className="submission-row" key={submission.id}><div className="submission-brand">{submission.logoUrl ? <img src={submission.logoUrl} alt="" /> : submission.name.slice(0, 1).toUpperCase()}</div><div><strong>{submission.name}</strong><p>{submission.tagline}</p><small>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(submission.updatedAt))}</small></div><div className={`submission-status ${submission.status}`}>{statusLabel[submission.status]}</div><div className="submission-actions">{["pending", "changes_requested"].includes(submission.status) && <Link href={`/dashboard/submissions/${submission.id}`}>Edit</Link>}{submission.convertedToolSlug && publishedToolSlugs.has(submission.convertedToolSlug) && <Link href={`/tools/${submission.convertedToolSlug}`}>View listing ↗</Link>}{submission.convertedToolSlug && !publishedToolSlugs.has(submission.convertedToolSlug) && <span>Draft awaiting publication</span>}</div></article>)}</div> : <div className="account-empty"><h3>No submissions yet.</h3><p>Found a developer tool RapidReach should cover? Send it to the editorial queue.</p><Link className="account-secondary" href="/submit-tool">Submit your first tool</Link></div>}</section>
        <aside className="account-panel profile-panel"><div className="account-panel-head"><div><span className="section-kicker">Account</span><h2>Profile</h2></div></div><form action={updateProfile} className="account-form compact"><label>Name<input name="name" defaultValue={user.name} required /></label><label>Email<input value={user.email} disabled /></label><button className="account-secondary" type="submit">Save profile</button></form><div className="profile-role"><span>Account type</span><strong>{user.role === "admin" ? "Administrator" : "Community member"}</strong></div><form action={logoutAccount}><button className="account-text-button" type="submit">Sign out</button></form></aside></div>
    </section>
  );
}
