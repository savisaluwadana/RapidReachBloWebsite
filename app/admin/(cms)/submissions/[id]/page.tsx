import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { approveSubmission, reviewSubmission } from "@/app/admin/submission-actions";
import { getDb } from "@/lib/mongodb";
import { getSubmissionById } from "@/lib/submissions";

const labels: Record<string, string> = { pending: "Pending review", in_review: "In review", changes_requested: "Changes requested", approved: "Approved", rejected: "Rejected" };

export default async function AdminSubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) notFound();
  const db = await getDb();
  const submitter = ObjectId.isValid(submission.userId) ? await db.collection("users").findOne({ _id: new ObjectId(submission.userId) }) : null;
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Submission review</span><h1>{submission.name}</h1><p>{submission.tagline}</p></div><Link className="cms-secondary" href="/admin/submissions">Back to queue</Link></header>
      <div className="submission-review-grid">
        <div className="cms-panel submission-review-main">
          <div className="submission-review-logo">{submission.logoUrl ? <img src={submission.logoUrl} alt={`${submission.name} logo`} /> : submission.name.slice(0, 1).toUpperCase()}</div>
          <div className="submission-review-meta"><span className={`cms-status ${submission.status}`}>{labels[submission.status]}</span><span>Submitted by <strong>{String(submitter?.name || "Unknown user")}</strong> · {String(submitter?.email || "")}</span></div>
          <h2>What it does</h2><p className="submission-description">{submission.description}</p>
          <dl className="submission-facts"><div><dt>Website</dt><dd><a href={submission.website} target="_blank" rel="noreferrer">{submission.website}</a></dd></div><div><dt>GitHub</dt><dd>{submission.github ? <a href={submission.github} target="_blank" rel="noreferrer">{submission.github}</a> : "—"}</dd></div><div><dt>Category</dt><dd>{submission.category}</dd></div><div><dt>Pricing</dt><dd>{submission.pricing}</dd></div><div><dt>Open source</dt><dd>{submission.openSource ? "Yes" : "No"}</dd></div><div><dt>Maker</dt><dd>{submission.maker || "—"}</dd></div><div><dt>Tags</dt><dd>{submission.tags.join(" · ") || "—"}</dd></div><div><dt>Why list it?</dt><dd>{submission.reason || "No additional context."}</dd></div></dl>
          {submission.screenshots.length > 0 && <div className="submission-screenshots">{submission.screenshots.map((url, index) => <img src={url} alt={`${submission.name} screenshot ${index + 1}`} key={url} />)}</div>}
        </div>
        <aside className="cms-panel submission-review-actions">
          <div className="cms-panel-head"><h2>Editorial decision</h2></div>
          {submission.convertedToolSlug && <div className="cms-success">Converted to draft: <Link href={`/admin/tools/${submission.convertedToolSlug}/edit`}>{submission.convertedToolSlug}</Link></div>}
          {submission.adminNotes && <div className="submission-note"><strong>Current note</strong><p>{submission.adminNotes}</p></div>}
          {submission.status !== "approved" && <>
            <form action={approveSubmission} className="cms-stack"><input type="hidden" name="id" value={submission.id} /><label>Editorial note<textarea name="adminNotes" rows={4} defaultValue={submission.adminNotes} placeholder="Optional internal/user-facing context" /></label><button className="cms-primary" type="submit">Approve → create tool draft</button></form>
            <div className="cms-decision-grid">
              {([ ["in_review", "Mark in review"], ["changes_requested", "Request changes"], ["rejected", "Reject"] ] as const).map(([status, label]) => <form action={reviewSubmission} key={status}><input type="hidden" name="id" value={submission.id} /><input type="hidden" name="status" value={status} /><input type="hidden" name="adminNotes" value={submission.adminNotes || ""} /><button className={status === "rejected" ? "cms-danger bordered" : "cms-secondary"} type="submit">{label}</button></form>)}
            </div>
          </>}
        </aside>
      </div>
    </section>
  );
}
