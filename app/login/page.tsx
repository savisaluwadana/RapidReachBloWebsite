import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { loginAccount } from "@/app/account-actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const current = await getCurrentUser();
  if (current) redirect(current.role === "admin" ? "/admin" : "/dashboard");
  const { error, next } = await searchParams;
  return (
    <section className="account-auth-shell shell">
      <div className="account-auth-copy"><span className="section-kicker">RapidReach account</span><h1>Sign in to your developer account.</h1><p>Submit tools for editorial review, track their status, and keep your RapidReach activity in one place.</p></div>
      <form action={loginAccount} className="account-auth-card">
        <input type="hidden" name="next" value={next || "/dashboard"} />
        <label>Email<input type="email" name="email" required autoComplete="email" autoFocus /></label>
        <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
        {error && <p className="account-error">{error}</p>}
        <button className="account-primary" type="submit">Sign in</button>
        <p>New to RapidReach? <Link href="/register">Create an account</Link></p>
      </form>
    </section>
  );
}
