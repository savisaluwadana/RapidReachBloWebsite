import Link from "next/link";
import { getAllSubmissions } from "@/lib/submissions";
import type { ToolSubmissionStatus } from "@/lib/types";

const labels: Record<string, string> = { pending: "Pending", in_review: "In review", changes_requested: "Changes requested", approved: "Approved", rejected: "Rejected" };

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const valid = ["pending", "in_review", "changes_requested", "approved", "rejected"].includes(status || "") ? status as ToolSubmissionStatus : undefined;
  const submissions = await getAllSubmissions(valid);
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Community queue</span><h1>Tool submissions</h1><p>Review community requests before they become editable tool drafts. Nothing submitted by a user publishes automatically.</p></div></header>
      <nav className="cms-filter-row"><Link className={!valid ? "active" : ""} href="/admin/submissions">All</Link>{Object.entries(labels).map(([key, label]) => <Link className={valid === key ? "active" : ""} key={key} href={`/admin/submissions?status=${key}`}>{label}</Link>)}</nav>
      <div className="cms-table submissions-table">
        <div className="cms-table-head"><span>Tool</span><span>Status</span><span>Category</span><span>Updated</span><span>Action</span></div>
        {submissions.map((submission) => <div className="cms-table-row" key={submission.id}><div><strong>{submission.name}</strong><small>{submission.tagline}</small></div><span className={`cms-status ${submission.status}`}>{labels[submission.status]}</span><span>{submission.category}</span><span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(submission.updatedAt))}</span><div className="cms-row-actions"><Link href={`/admin/submissions/${submission.id}`}>Review</Link>{submission.convertedToolSlug && <Link href={`/admin/tools/${submission.convertedToolSlug}/edit`}>Tool draft</Link>}</div></div>)}
        {!submissions.length && <div className="cms-empty-row">No submissions in this queue.</div>}
      </div>
    </section>
  );
}
