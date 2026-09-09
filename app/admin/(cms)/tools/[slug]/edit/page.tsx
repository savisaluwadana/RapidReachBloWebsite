import { notFound } from "next/navigation";
import { ToolForm } from "@/components/admin/ToolForm";
import { getCategoriesByKind } from "@/lib/categories";
import { getToolBySlug } from "@/lib/tools";

export default async function EditToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tool, categories] = await Promise.all([getToolBySlug(slug, true), getCategoriesByKind("tool")]);
  if (!tool) notFound();
  return <section className="cms-page"><header className="cms-page-head"><div><span className="section-kicker">Discovery</span><h1>Edit tool</h1><p>{tool.name}</p></div></header><ToolForm tool={tool} categories={categories}/></section>;
}
