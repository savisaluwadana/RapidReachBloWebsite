import type { Category, ToolSubmission } from "@/lib/types";
import { saveToolSubmission } from "@/app/account-actions";
import { MediaUploader } from "@/components/admin/MediaUploader";

export function SubmissionForm({ submission, categories }: { submission?: ToolSubmission | null; categories: Category[] }) {
  return (
    <form action={saveToolSubmission} className="account-form submission-form">
      {submission && <input type="hidden" name="submissionId" value={submission.id} />}
      <div className="account-form-grid two">
        <label>Tool name<input name="name" required defaultValue={submission?.name} placeholder="Acme DevTool" /></label>
        <label>Maker / company<input name="maker" defaultValue={submission?.maker} placeholder="Company or community" /></label>
      </div>
      <label>Tagline<input name="tagline" required defaultValue={submission?.tagline} placeholder="One sharp sentence explaining the tool." /></label>
      <label>Full explanation<textarea name="description" required rows={8} defaultValue={submission?.description} placeholder="What does it do, who is it for, and why is it useful?" /></label>
      <div className="account-form-grid two">
        <label>Website<input name="website" type="url" required defaultValue={submission?.website} placeholder="https://example.com" /></label>
        <label>GitHub URL<input name="github" type="url" defaultValue={submission?.github} placeholder="https://github.com/..." /></label>
      </div>
      <MediaUploader inputName="logoUrl" label="Tool logo" kind="submission-logo" initialUrls={submission?.logoUrl ? [submission.logoUrl] : []} handleUploadUrl="/api/media/upload" help="Upload the official logo or paste a public image URL." />
      <MediaUploader inputName="screenshots" label="Product screenshots" kind="submission-screenshot" initialUrls={submission?.screenshots || []} multiple handleUploadUrl="/api/media/upload" help="Up to 8 screenshots. These are reviewed before any public listing is created." />
      <div className="account-form-grid three">
        <label>Category<select name="category" required defaultValue={submission?.category || categories[0]?.slug}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
        <label>Pricing<select name="pricing" defaultValue={submission?.pricing || "free"}><option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option><option value="open-source">Open source</option></select></label>
        <label>Tags<input name="tags" defaultValue={submission?.tags.join(", ")} placeholder="kubernetes, observability, ai" /></label>
      </div>
      <label className="account-check"><input name="openSource" type="checkbox" defaultChecked={submission?.openSource} /> This tool is open source</label>
      <label>Why should RapidReach list it?<textarea name="reason" rows={4} defaultValue={submission?.reason} placeholder="Optional context for the editorial team." /></label>
      {submission?.adminNotes && <div className="submission-note"><strong>Editorial feedback</strong><p>{submission.adminNotes}</p></div>}
      <div className="account-form-actions"><button className="account-primary" type="submit">{submission ? "Resubmit for review" : "Submit tool for review"}</button><a className="account-secondary" href="/dashboard">Cancel</a></div>
      <p className="account-fineprint">Submissions never publish automatically. RapidReach reviews and edits every listing before publication.</p>
    </form>
  );
}
