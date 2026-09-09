import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { registerAccount } from "@/app/account-actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const current = await getCurrentUser();
  if (current) redirect(current.role === "admin" ? "/admin" : "/dashboard");
  const { error } = await searchParams;
  return (
    <section className="account-auth-shell shell">
      <div className="account-auth-copy"><span className="section-kicker">Join RapidReach</span><h1>Create a reader account.</h1><p>Accounts are for community participation and tool submissions. Publishing stays with the RapidReach editorial team.</p></div>
      <form action={registerAccount} className="account-auth-card">
        <label>Name<input name="name" required autoComplete="name" autoFocus /></label>
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        <label>Password<input type="password" name="password" required minLength={10} autoComplete="new-password" /><small>At least 10 characters.</small></label>
        {error && <p className="account-error">{error}</p>}
        <button className="account-primary" type="submit">Create account</button>
        <p>Already registered? <Link href="/login">Sign in</Link></p>
      </form>
    </section>
  );
}
