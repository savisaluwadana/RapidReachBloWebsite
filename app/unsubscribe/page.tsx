import type { Metadata } from "next";
import Link from "next/link";
import { getDb, hasDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage Newsletter Subscription",
  robots: { index: false, follow: false },
};

function validToken(value: string) {
  return /^[a-f0-9]{48}$/i.test(value);
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "your email address";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token: rawToken, error } = await searchParams;
  const token = String(rawToken || "").trim();

  if (error === "invalid" || !validToken(token)) {
    return (
      <main className="shell archive-page">
        <header className="archive-header">
          <span className="section-kicker">RapidReach briefing</span>
          <h1>That subscription link is invalid.</h1>
          <p>Open the subscription-management link from the most recent RapidReach email, or return to the briefing page.</p>
          <Link className="primary-button" href="/briefing">Back to the briefing</Link>
        </header>
      </main>
    );
  }

  if (!hasDatabase()) {
    return (
      <main className="shell archive-page">
        <header className="archive-header">
          <span className="section-kicker">RapidReach briefing</span>
          <h1>Subscription management is temporarily unavailable.</h1>
          <p>Please try this link again later.</p>
        </header>
      </main>
    );
  }

  const db = await getDb();
  const subscriber = await db.collection("newsletter_subscribers").findOne(
    { unsubscribeToken: token },
    { projection: { email: 1, status: 1 } },
  );

  if (!subscriber) {
    return (
      <main className="shell archive-page">
        <header className="archive-header">
          <span className="section-kicker">RapidReach briefing</span>
          <h1>That subscription link has expired or is invalid.</h1>
          <p>No subscription was changed.</p>
          <Link className="primary-button" href="/briefing">Back to the briefing</Link>
        </header>
      </main>
    );
  }

  const unsubscribed = subscriber.status === "unsubscribed";
  return (
    <main className="shell archive-page">
      <header className="archive-header">
        <span className="section-kicker">RapidReach briefing</span>
        <h1>{unsubscribed ? "You’re currently unsubscribed." : "Manage your subscription."}</h1>
        <p>
          {unsubscribed
            ? `RapidReach is not sending the weekly briefing to ${maskEmail(String(subscriber.email || ""))}.`
            : `Confirm below to stop the weekly briefing for ${maskEmail(String(subscriber.email || ""))}.`}
        </p>
        <form action="/api/newsletter/unsubscribe" method="post">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="intent" value={unsubscribed ? "resubscribe" : "unsubscribe"} />
          <button className="primary-button" type="submit">
            {unsubscribed ? "Resubscribe to the briefing" : "Confirm unsubscribe"}
          </button>
        </form>
        <p><Link href="/briefing">Cancel and return to RapidReach</Link></p>
      </header>
    </main>
  );
}
