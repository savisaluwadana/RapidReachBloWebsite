function deploymentSiteCandidate() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return `https://${productionHost.replace(/^https?:\/\//, "")}`;

  const deploymentHost = process.env.VERCEL_URL?.trim();
  if (deploymentHost) return `https://${deploymentHost.replace(/^https?:\/\//, "")}`;

  return process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
}

export function normalizedSiteUrl() {
  const raw = deploymentSiteCandidate();
  if (!raw) {
    throw new Error("RapidReach public site URL is not configured. Set NEXT_PUBLIC_SITE_URL for production.");
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Public site URL must use http or https.");
    }
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch (error) {
    throw new Error(`Invalid RapidReach public site URL: ${raw}`, { cause: error });
  }
}

export function validDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isoDate(value: string | Date | undefined | null): string | undefined {
  return validDate(value)?.toISOString();
}

export function formatDate(
  value: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions,
  fallback = "Date unavailable",
) {
  const date = validDate(value);
  return date ? new Intl.DateTimeFormat("en", options).format(date) : fallback;
}

export function encodedPathSegment(value: string) {
  return encodeURIComponent(value.trim());
}


export function slugPathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
