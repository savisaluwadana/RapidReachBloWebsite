import { getCurrentUser, requireAdminUser } from "@/lib/auth";

export function adminIsConfigured() {
  return Boolean(process.env.MONGODB_URI && process.env.ADMIN_PASSWORD);
}

export async function isAdmin() {
  return (await getCurrentUser())?.role === "admin";
}

export async function requireAdmin() {
  return requireAdminUser();
}
