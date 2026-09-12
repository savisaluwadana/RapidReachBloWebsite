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
  const [submitter, convertedTool] = await Promise.all([
    ObjectId.isValid(submission.userId)
      ? db.collection("users").findOne({ _id: new ObjectId(submission.userId) })
      : Promise.resolve(null),
    submission.convertedToolSlug
      ? db.collection("tools").findOne({ slug: submission.convertedToolSlug }, { projection: { _id: 1 } })
      : Promise.resolve(null),
  ]);
  const hasConvertedTool = Boolean(submission.convertedToolSlug && convertedTool);

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
          {hasConvertedTool && <div className="cms-success">Converted to draft: <Link href={`/admin/tools/${submission.convertedToolSlug}/edit`}>{submission.convertedToolSlug}</Link></div>}
          {submission.convertedToolSlug && !convertedTool && <div className="cms-warning">The converted draft <strong>{submission.convertedToolSlug}</strong> was later removed. The approval is preserved and the draft can be recreated below.</div>}

          {submission.status !== "approved" && <>
            <form action={approveSubmission} className="cms-stack"><input type="hidden" name="id" value={submission.id} /><label>Approval note<textarea name="adminNotes" rows={3} defaultValue={submission.adminNotes} placeholder="Optional note recorded with the approval" /></label><button className="cms-primary" type="submit">Approve → create tool draft</button></form>
            <form action={reviewSubmission} className="cms-stack cms-review-form"><input type="hidden" name="id" value={submission.id} /><label>Review note<textarea name="adminNotes" rows={4} defaultValue={submission.adminNotes} placeholder="Tell the submitter what is needed, or record why it was rejected." /></label><div className="cms-decision-grid"><button className="cms-secondary" name="status" value="in_review" type="submit">Mark in review</button><button className="cms-secondary" name="status" value="changes_requested" type="submit">Request changes</button><button className="cms-danger bordered" name="status" value="rejected" type="submit">Reject</button></div></form>
          </>}

          {submission.status === "approved" && hasConvertedTool && <p className="cms-warning">This request has already been converted into an editable tool draft. Publishing is controlled from the tool editor.</p>}
          {submission.status === "approved" && !hasConvertedTool && <>
            <p className="cms-warning">This submission is approved, but its converted tool draft is missing. Recreate the draft without changing the approval history.</p>
            <form action={approveSubmission} className="cms-stack"><input type="hidden" name="id" value={submission.id} /><label>Recovery note<textarea name="adminNotes" rows={3} defaultValue={submission.adminNotes} placeholder="Optional note about why the draft was recreated" /></label><button className="cms-primary" type="submit">Recreate tool draft</button></form>
          </>}
        </aside>
      </div>
    </section>
  );
}
