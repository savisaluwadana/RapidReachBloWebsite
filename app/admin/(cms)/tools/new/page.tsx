import { ToolForm } from "@/components/admin/ToolForm";
import { getCategoriesByKind } from "@/lib/categories";

export default async function NewToolPage() {
  const categories = await getCategoriesByKind("tool");
  return <section className="cms-page"><header className="cms-page-head"><div><span className="section-kicker">Discovery</span><h1>Add developer tool</h1><p>Create a structured listing that is useful to developers, search engines, and agents.</p></div></header><ToolForm categories={categories}/></section>;
}
