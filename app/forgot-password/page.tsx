import Link from "next/link";
import { requestPasswordReset } from "@/app/account-actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <section className="account-auth-shell shell">
      <div className="account-auth-copy">
        <span className="section-kicker">Account recovery</span>
        <h1>Reset your RapidReach password.</h1>
        <p>Enter your account email. If an active account exists, RapidReach will send a one-hour reset link.</p>
      </div>
      <form action={requestPasswordReset} className="account-auth-card">
        <label>Email<input type="email" name="email" required autoComplete="email" autoFocus /></label>
        {sent === "1" && <p className="account-success">If that address belongs to an active account, a reset link has been sent.</p>}
        {error === "config" && <p className="account-error">Account email delivery is not configured. Contact the site administrator.</p>}
        <button className="account-primary" type="submit">Send reset link</button>
        <p><Link href="/login">Back to sign in</Link></p>
      </form>
    </section>
  );
}
