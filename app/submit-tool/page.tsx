import { requireUser } from "@/lib/auth";
import { getCategoriesByKind } from "@/lib/categories";
import { SubmissionForm } from "@/components/SubmissionForm";

export const dynamic = "force-dynamic";

export default async function SubmitToolPage() {
  await requireUser();
  const categories = await getCategoriesByKind("tool");
  return (
    <section className="account-editor shell">
      <header className="account-editor-head"><span className="section-kicker">Community submission</span><h1>Recommend a developer tool.</h1><p>Send the official product details to RapidReach. The editorial team reviews every request before a listing can be created.</p></header>
      <SubmissionForm categories={categories} />
    </section>
  );
}
