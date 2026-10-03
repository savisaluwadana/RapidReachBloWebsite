import { ObjectId } from "mongodb";
import { getDb, hasDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  if (!hasDatabase()) {
    return <section className="cms-page"><header className="cms-page-head"><div><span className="section-kicker">Governance</span><h1>Audit log</h1><p>MongoDB is not configured in this environment.</p></div></header></section>;
  }

  const db = await getDb();
  const events = await db.collection("admin_audit_log").find({}).sort({ createdAt: -1 }).limit(100).toArray();
  const actorIds = [...new Set(events.map((event) => String(event.actorId || "")).filter((id) => ObjectId.isValid(id)))];
  const users = actorIds.length
    ? await db.collection("users").find({ _id: { $in: actorIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1, email: 1 } }).toArray()
    : [];
  const actorMap = new Map(users.map((user) => [String(user._id), { name: String(user.name || "Admin"), email: String(user.email || "") }]));

  return (
    <section className="cms-page">
      <header className="cms-page-head">
        <div><span className="section-kicker">Governance</span><h1>Audit log</h1><p>The latest administrator changes affecting users, moderation, submissions, and editorial content.</p></div>
      </header>
      <div className="cms-table">
        <div className="cms-table-head"><span>Action</span><span>Target</span><span>Administrator</span><span>Time</span><span>Details</span></div>
        {events.map((event) => {
          const actor = actorMap.get(String(event.actorId || ""));
          return (
            <div className="cms-table-row" key={String(event._id)}>
              <strong>{String(event.action || "admin.action")}</strong>
              <span>{String(event.targetType || "item")} · {String(event.targetId || "")}</span>
              <div><strong>{actor?.name || "Administrator"}</strong><small>{actor?.email || String(event.actorId || "")}</small></div>
              <span>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(event.createdAt || new Date().toISOString())))}</span>
              <small>{Object.keys((event.metadata || {}) as Record<string, unknown>).length ? JSON.stringify(event.metadata) : "—"}</small>
            </div>
          );
        })}
        {!events.length && <div className="cms-empty-row">No administrator changes have been recorded yet.</div>}
      </div>
    </section>
  );
}
