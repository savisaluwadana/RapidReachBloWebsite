import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { loginAdminAccount } from "@/app/account-actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="cms-login-shell">
      <section className="cms-login-card">
        <span className="section-kicker">RapidReach CMS</span>
        <h1>Editorial access.</h1>
        <p>Admin accounts use the same secure account system as RapidReach members, with publishing permissions enforced by role.</p>
        <form action={loginAdminAccount} className="cms-stack">
          <label>Email<input type="email" name="email" required autoComplete="email" autoFocus /></label>
          <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
          {error && <p className="cms-error">{error}</p>}
          <button className="cms-primary" type="submit">Enter CMS</button>
        </form>
        <p className="cms-login-help">On a fresh database, the first admin can be bootstrapped with <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code>.</p>
      </section>
    </main>
  );
}
