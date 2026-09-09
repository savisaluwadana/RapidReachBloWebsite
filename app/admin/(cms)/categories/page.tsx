import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { getCategoriesByKind } from "@/lib/categories";

export default async function CategoriesAdmin() {
  const [postCategories, toolCategories] = await Promise.all([getCategoriesByKind("post"), getCategoriesByKind("tool")]);
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Taxonomy</span><h1>Categories</h1><p>Keep editorial coverage and tool discovery organized independently.</p></div></header>
      <form action={saveCategory} className="cms-inline-create">
        <label>Name<input name="name" required placeholder="Platform Engineering" /></label>
        <label>Slug<input name="slug" placeholder="platform-engineering" /></label>
        <label>Type<select name="kind"><option value="post">News category</option><option value="tool">Tool category</option></select></label>
        <label className="wide">Description<input name="description" placeholder="What belongs in this category?" /></label>
        <button className="cms-primary" type="submit">Add category</button>
      </form>
      <div className="cms-split">
        <CategoryList title="News categories" kind="post" categories={postCategories} />
        <CategoryList title="Tool categories" kind="tool" categories={toolCategories} />
      </div>
    </section>
  );
}

function CategoryList({ title, kind, categories }: { title: string; kind: "post" | "tool"; categories: Awaited<ReturnType<typeof getCategoriesByKind>> }) {
  return <section className="cms-panel"><div className="cms-panel-head"><h2>{title}</h2><span>{categories.length}</span></div><div className="cms-list">{categories.map((category) => <div className="cms-row" key={category.slug}><div><strong>{category.name}</strong><span>/{category.slug}</span><p>{category.description || "No description yet."}</p></div><form action={deleteCategory}><input type="hidden" name="slug" value={category.slug}/><input type="hidden" name="kind" value={kind}/><button className="cms-danger" type="submit">Delete</button></form></div>)}</div></section>;
}
