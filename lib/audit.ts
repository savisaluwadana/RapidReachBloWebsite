import type { Db } from "mongodb";

export async function recordAdminAudit(
  db: Db,
  input: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  },
) {
  await db.collection("admin_audit_log").insertOne({
    ...input,
    metadata: input.metadata || {},
    createdAt: new Date().toISOString(),
  });
}
