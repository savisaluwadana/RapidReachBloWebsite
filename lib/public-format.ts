export function normalizedSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "https://rapidreach.dev").trim();
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "https://rapidreach.dev";
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    return "https://rapidreach.dev";
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
