import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "@/app/admin/actions";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="cms-shell">
      <aside className="cms-sidebar">
        <Link className="cms-brand" href="/admin"><span className="brand-mark">R</span><span>RapidReach CMS</span></Link>
        <nav>
          <Link href="/admin">Overview</Link>
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/tools">Tools</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/" target="_blank">View site ↗</Link>
        </nav>
        <form action={logoutAdmin}><button className="cms-logout" type="submit">Sign out</button></form>
      </aside>
      <main className="cms-main">{children}</main>
    </div>
  );
}
