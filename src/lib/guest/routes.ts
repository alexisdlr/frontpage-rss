import { scopeToSearchParams } from "@/src/lib/scope";

import type { ItemListScope } from "@/src/types/actions";

export function getGuestListHref(scope: ItemListScope): string {
  switch (scope.type) {
    case "feed":
      return `/guest/feed/${scope.feedId}`;
    case "category":
      return `/guest/category/${scope.categoryId}`;
    case "uncategorized":
      return "/guest/category/uncategorized";
    default:
      return "/guest";
  }
}

export function buildGuestReaderHref(
  itemId: string,
  scope: ItemListScope,
): string {
  const params = new URLSearchParams(scopeToSearchParams(scope));
  const query = params.toString();
  return query ? `/guest/reader/${itemId}?${query}` : `/guest/reader/${itemId}`;
}
