export function getFeedDisplayTitle(feed: {
  customTitle: string | null;
  url: string;
}): string {
  return feed.customTitle?.trim() || feed.url;
}

export function formatPublishedDate(iso: string | null): string {
  if (!iso) return "Unknown date";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (diffDays < 7) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
}

export function formatFullDate(iso: string | null): string {
  if (!iso) return "Unknown date";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getItemExcerpt(item: {
  description: string | null;
  contentHtml: string | null;
  title: string | null;
}): string | null {
  const raw = item.description?.trim() || (item.contentHtml ? stripHtml(item.contentHtml) : "");
  if (!raw) return null;

  const normalized = raw.replace(/\s+/g, " ").trim();
  if (normalized.length <= 200) return normalized;

  return `${normalized.slice(0, 197).trimEnd()}…`;
}
