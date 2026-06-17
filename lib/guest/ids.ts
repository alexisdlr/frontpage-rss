import { createHash } from "crypto";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function guestCategoryId(name: string): string {
  return `guest-cat-${slugify(name)}`;
}

export function guestFeedId(feedUrl: string): string {
  const hash = createHash("sha256").update(feedUrl).digest("hex").slice(0, 12);
  return `guest-feed-${hash}`;
}

export function guestItemId(feedId: string, guid: string): string {
  const hash = createHash("sha256")
    .update(`${feedId}:${guid}`)
    .digest("hex")
    .slice(0, 16);
  return `guest-item-${hash}`;
}
