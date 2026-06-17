import iconv from "iconv-lite";

function detectCharset(
  contentType: string | undefined,
  xmlProlog: string,
): string {
  const headerMatch = contentType?.match(/charset=([^;\s]+)/i);
  if (headerMatch?.[1]) {
    return headerMatch[1].replace(/['"]/g, "").trim();
  }

  const xmlMatch = xmlProlog.match(/encoding=["']([^"']+)["']/i);
  if (xmlMatch?.[1]) {
    return xmlMatch[1].trim();
  }

  return "utf-8";
}

export function decodeFeedBody(
  raw: string | Buffer,
  contentType?: string,
): string {
  const buffer =
    typeof raw === "string" ? Buffer.from(raw, "binary") : raw;

  const prolog = buffer.slice(0, 256).toString("ascii");
  const charset = detectCharset(contentType, prolog).toLowerCase();

  if (charset === "utf-8" || charset === "utf8") {
    return buffer.toString("utf-8");
  }

  if (iconv.encodingExists(charset)) {
    return iconv.decode(buffer, charset);
  }

  // Common mislabeled encodings
  for (const fallback of ["iso-8859-1", "windows-1252", "utf-8"]) {
    try {
      return iconv.decode(buffer, fallback);
    } catch {
      continue;
    }
  }

  return buffer.toString("utf-8");
}
