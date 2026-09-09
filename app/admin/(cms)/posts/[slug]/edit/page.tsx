import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getCategoriesByKind } from "@/lib/categories";
import { getAdminPostBySlug } from "@/lib/posts";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([getAdminPostBySlug(slug), getCategoriesByKind("post")]);
  if (!post) notFound();
  return <section className="cms-page"><header className="cms-page-head"><div><span className="section-kicker">Editorial</span><h1>Edit post</h1><p>{post.title}</p></div></header><PostForm post={post} categories={categories}/></section>;
}
