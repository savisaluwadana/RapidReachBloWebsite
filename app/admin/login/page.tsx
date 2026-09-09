import { redirect } from "next/navigation";
import { adminIsConfigured, isAdmin } from "@/lib/admin-auth";
import { loginAdmin } from "@/app/admin/actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="cms-login-shell">
      <section className="cms-login-card">
        <span className="section-kicker">RapidReach CMS</span>
        <h1>Editorial access.</h1>
        <p>Manage developer news, categories, and the developer-tool directory.</p>
        {!adminIsConfigured() ? <div className="cms-warning">Set <code>ADMIN_PASSWORD</code> before using the CMS.</div> : (
          <form action={loginAdmin} className="cms-stack">
            <label>Password<input type="password" name="password" required autoComplete="current-password" autoFocus /></label>
            {error && <p className="cms-error">That password did not match.</p>}
            <button className="cms-primary" type="submit">Enter CMS</button>
          </form>
        )}
      </section>
    </main>
  );
}
