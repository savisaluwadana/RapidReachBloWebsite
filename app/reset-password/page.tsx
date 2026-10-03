import Link from "next/link";
import { resetPasswordAccount } from "@/app/account-actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token = "", error } = await searchParams;
  return (
    <section className="account-auth-shell shell">
      <div className="account-auth-copy">
        <span className="section-kicker">Account recovery</span>
        <h1>Choose a new password.</h1>
        <p>Reset links expire after one hour and are single-use.</p>
      </div>
      <form action={resetPasswordAccount} className="account-auth-card">
        <input type="hidden" name="token" value={token} />
        <label>New password<input type="password" name="password" required minLength={10} autoComplete="new-password" /></label>
        <label>Confirm password<input type="password" name="confirmPassword" required minLength={10} autoComplete="new-password" /></label>
        {error && <p className="account-error">{error}</p>}
        <button className="account-primary" type="submit" disabled={!token}>Reset password</button>
        {!token && <p className="account-error">This reset link is missing its token. Request a new password reset email.</p>}
        <p><Link href="/forgot-password">Request another link</Link></p>
      </form>
    </section>
  );
}
