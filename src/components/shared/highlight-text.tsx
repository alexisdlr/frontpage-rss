type HighlightTextProps = {
  text: string;
  query?: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightText({ text, query }: HighlightTextProps) {
  const term = query?.trim();
  if (!term) return <>{text}</>;

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            className="rounded-sm bg-accent-subtle text-text-primary"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}
