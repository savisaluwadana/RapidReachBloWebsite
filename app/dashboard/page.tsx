import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserSubmissions } from "@/lib/submissions";
import { logoutAccount, updateProfile } from "@/app/account-actions";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending: "Pending review",
  in_review: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ submitted?: string; profile?: string }> }) {
  const user = await requireUser();
  const submissions = await getUserSubmissions(user.id);
  const { submitted, profile } = await searchParams;
  const openCount = submissions.filter((item) => ["pending", "in_review", "changes_requested"].includes(item.status)).length;
  return (
    <section className="account-dashboard shell">
      <header className="account-dashboard-head">
        <div><span className="section-kicker">Your RapidReach</span><h1>Dashboard</h1><p>Welcome back, {user.name}. Track tool submissions and manage your account here.</p></div>
        <div className="account-dashboard-actions"><Link className="account-primary" href="/submit-tool">Submit a tool</Link>{user.role === "admin" && <Link className="account-secondary" href="/admin">Open CMS</Link>}</div>
      </header>

      {submitted && <div className="account-success">Your tool was submitted for editorial review.</div>}
      {profile === "updated" && <div className="account-success">Profile updated.</div>}

      <div className="account-stat-grid">
        <div><strong>{submissions.length}</strong><span>Total submissions</span></div>
        <div><strong>{openCount}</strong><span>In the review queue</span></div>
        <div><strong>{submissions.filter((item) => item.status === "approved").length}</strong><span>Approved</span></div>
      </div>

      <div className="account-dashboard-grid">
        <section className="account-panel">
          <div className="account-panel-head"><div><span className="section-kicker">Tool requests</span><h2>My submissions</h2></div><Link href="/submit-tool">New submission ↗</Link></div>
          {submissions.length ? <div className="submission-list">{submissions.map((submission) => (
            <article className="submission-row" key={submission.id}>
              <div className="submission-brand">{submission.logoUrl ? <img src={submission.logoUrl} alt="" /> : submission.name.slice(0, 1).toUpperCase()}</div>
              <div><strong>{submission.name}</strong><p>{submission.tagline}</p><small>Updated {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(submission.updatedAt))}</small></div>
              <div className={`submission-status ${submission.status}`}>{statusLabel[submission.status]}</div>
              <div className="submission-actions">{["pending", "changes_requested"].includes(submission.status) && <Link href={`/dashboard/submissions/${submission.id}`}>Edit</Link>}{submission.convertedToolSlug && <Link href={`/tools/${submission.convertedToolSlug}`}>View listing ↗</Link>}</div>
            </article>
          ))}</div> : <div className="account-empty"><h3>No submissions yet.</h3><p>Found a developer tool RapidReach should cover? Send it to the editorial queue.</p><Link className="account-secondary" href="/submit-tool">Submit your first tool</Link></div>}
        </section>

        <aside className="account-panel profile-panel">
          <div className="account-panel-head"><div><span className="section-kicker">Account</span><h2>Profile</h2></div></div>
          <form action={updateProfile} className="account-form compact">
            <label>Name<input name="name" defaultValue={user.name} required /></label>
            <label>Email<input value={user.email} disabled /></label>
            <button className="account-secondary" type="submit">Save profile</button>
          </form>
          <div className="profile-role"><span>Account type</span><strong>{user.role === "admin" ? "Administrator" : "Community member"}</strong></div>
          <form action={logoutAccount}><button className="account-text-button" type="submit">Sign out</button></form>
        </aside>
      </div>
    </section>
  );
}
