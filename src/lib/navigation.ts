/** Routes where feed lists are browsed — bar-only transitions, no full-screen logo. */
export function isFeedBrowseRoute(pathname: string): boolean {
  if (
    pathname === "/dashboard" ||
    pathname === "/saved" ||
    pathname === "/guest"
  ) {
    return true;
  }

  if (
    pathname.startsWith("/feed/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/guest/feed/") ||
    pathname.startsWith("/guest/category/")
  ) {
    return true;
  }

  return false;
}

export function isFeedBrowseNavigation(from: string, to: string): boolean {
  return isFeedBrowseRoute(from) && isFeedBrowseRoute(to);
}

/** Full-screen logo unless both routes are feed-browse views (dashboard ↔ feed, etc.). */
export function shouldShowNavigationOverlay(from: string, to: string): boolean {
  return !isFeedBrowseNavigation(from, to);
}
