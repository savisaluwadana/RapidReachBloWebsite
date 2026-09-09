import { updateUserAccount } from "@/app/admin/submission-actions";
import { getDb, hasDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = hasDatabase() ? await (await getDb()).collection("users").find({}).sort({ createdAt: -1 }).toArray() : [];
  return (
    <section className="cms-page">
      <header className="cms-page-head"><div><span className="section-kicker">Community</span><h1>Users</h1><p>Manage account access and administrator roles. Normal users never receive publishing permissions.</p></div></header>
      {!hasDatabase() && <div className="cms-warning">MongoDB is not configured, so user accounts are unavailable in this environment.</div>}
      <div className="cms-table users-table">
        <div className="cms-table-head"><span>User</span><span>Role</span><span>Status</span><span>Joined</span><span>Manage</span></div>
        {users.map((user) => <form action={updateUserAccount} className="cms-table-row" key={String(user._id)}><input type="hidden" name="id" value={String(user._id)} /><div><strong>{String(user.name || "Developer")}</strong><small>{String(user.email || "")}</small></div><select name="role" defaultValue={user.role === "admin" ? "admin" : "user"}><option value="user">User</option><option value="admin">Admin</option></select><select name="status" defaultValue={user.status === "disabled" ? "disabled" : "active"}><option value="active">Active</option><option value="disabled">Disabled</option></select><span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(String(user.createdAt || new Date().toISOString())))}</span><button className="cms-secondary" type="submit">Save</button></form>)}
        {hasDatabase() && users.length === 0 && <div className="cms-empty-row">No accounts have been created yet.</div>}
      </div>
    </section>
  );
}
