import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCategoriesByKind } from "@/lib/categories";
import { canUserEditSubmission, getUserSubmission } from "@/lib/submissions";
import { SubmissionForm } from "@/components/SubmissionForm";

export default async function EditSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [submission, categories] = await Promise.all([getUserSubmission(user.id, id), getCategoriesByKind("tool")]);
  if (!submission || !canUserEditSubmission(submission.status)) notFound();
  return (
    <section className="account-editor shell">
      <header className="account-editor-head"><span className="section-kicker">Update submission</span><h1>{submission.name}</h1><p>Update the requested details and send it back to the editorial queue.</p></header>
      <SubmissionForm submission={submission} categories={categories} />
    </section>
  );
}
