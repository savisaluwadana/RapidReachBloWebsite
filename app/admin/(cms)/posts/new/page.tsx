import { PostForm } from "@/components/admin/PostForm";
import { getCategoriesByKind } from "@/lib/categories";

export default async function NewPostPage() {
  const categories = await getCategoriesByKind("post");
  return <section className="cms-page"><header className="cms-page-head"><div><span className="section-kicker">Editorial</span><h1>New post</h1><p>Write for humans first, while keeping the summary and takeaways answer-friendly for search and agents.</p></div></header><PostForm categories={categories}/></section>;
}
