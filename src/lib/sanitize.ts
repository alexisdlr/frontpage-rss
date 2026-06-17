import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "h1",
  "h2",
  "figure",
  "figcaption",
]);

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height"],
  "*": ["class"],
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
      img: (_tagName, attribs) => ({
        tagName: "img",
        attribs: {
          ...attribs,
          loading: "lazy",
          decoding: "async",
        },
      }),
    },
  });
}

export function hasReaderContent(contentHtml: string | null): boolean {
  if (!contentHtml?.trim()) return false;
  const stripped = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped.length > 80;
}
