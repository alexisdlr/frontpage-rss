import type { ItemListScope } from "@/src/types/actions";

export function parseItemListScope(
  searchParams: Record<string, string | string[] | undefined>,
): ItemListScope {
  const scope =
    typeof searchParams.scope === "string" ? searchParams.scope : "all";

  if (scope === "feed") {
    const feedId =
      typeof searchParams.feedId === "string" ? searchParams.feedId : "";
    if (feedId) return { type: "feed", feedId };
  }

  if (scope === "category") {
    const categoryId =
      typeof searchParams.categoryId === "string"
        ? searchParams.categoryId
        : "";
    if (categoryId) return { type: "category", categoryId };
  }

  if (scope === "uncategorized") {
    return { type: "uncategorized" };
  }

  return { type: "all" };
}

export function scopeToSearchParams(
  scope: ItemListScope,
): Record<string, string> {
  switch (scope.type) {
    case "feed":
      return { scope: "feed", feedId: scope.feedId };
    case "category":
      return { scope: "category", categoryId: scope.categoryId };
    case "uncategorized":
      return { scope: "uncategorized" };
    default:
      return { scope: "all" };
  }
}

export function buildReaderHref(itemId: string, scope: ItemListScope): string {
  const params = new URLSearchParams(scopeToSearchParams(scope));
  const query = params.toString();
  return query ? `/reader/${itemId}?${query}` : `/reader/${itemId}`;
}

export function getScopeLabel(
  scope: ItemListScope,
  context?: {
    categoryName?: string;
    feedTitle?: string;
  },
): string {
  switch (scope.type) {
    case "feed":
      return context?.feedTitle ?? "Feed";
    case "category":
      return context?.categoryName ?? "Category";
    case "uncategorized":
      return "Uncategorized";
    default:
      return "All items";
  }
}
