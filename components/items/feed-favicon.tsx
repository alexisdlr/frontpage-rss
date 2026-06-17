type FeedFaviconProps = {
  url: string | null;
  title: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
} as const;

export function FeedFavicon({
  url,
  title,
  size = "sm",
  className,
}: FeedFaviconProps) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size === "sm" ? 16 : 20}
        height={size === "sm" ? 16 : 20}
        className={`${sizeClasses[size]} shrink-0 rounded-sm object-cover ${className ?? ""}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-bg-tertiary font-medium text-text-secondary ${
        size === "sm" ? "size-4 text-[10px]" : "size-5 text-xs"
      } ${className ?? ""}`}
    >
      {initial}
    </span>
  );
}
