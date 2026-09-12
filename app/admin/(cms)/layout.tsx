import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="cms-shell">
      <aside className="cms-sidebar">
        <Link className="cms-brand" href="/admin"><span className="brand-mark">R</span><span>RapidReach CMS</span></Link>
        <nav>
          <Link href="/admin">Overview</Link>
          <Link href="/admin/submissions">Submissions</Link>
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/tools">Tools</Link>
          <Link href="/admin/collections">Collections</Link>
          <Link href="/admin/briefing">Weekly briefing</Link>
          <Link href="/admin/categories">Categories</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/launches" target="_blank">Launch board ↗</Link>
          <Link href="/" target="_blank">View site ↗</Link>
        </nav>
        <div className="cms-admin-identity"><span>Signed in as</span><strong>{admin.name}</strong><small>{admin.email}</small></div>
        <form action={logoutAdmin}><button className="cms-logout" type="submit">Sign out</button></form>
      </aside>
      <main className="cms-main"><div className="cms-page-frame">{children}</div></main>
    </div>
  );
}
