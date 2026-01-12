// Small HTML helpers used across pages.

export function decodeHtmlEntities(input: string): string {
  // Handles strings that contain escaped HTML like "&lt;p&gt;Hello&lt;/p&gt;".
  if (!input) return "";
  if (typeof document === "undefined") return input;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
}

export function stripHtmlTags(html: string): string {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function toPlainText(maybeHtmlOrEscapedHtml: string): string {
  // 1) decode escaped entities (if present), 2) strip tags, 3) normalize whitespace.
  const decoded = decodeHtmlEntities(maybeHtmlOrEscapedHtml || "");
  return stripHtmlTags(decoded);
}

export function normalizeHtmlString(maybeEscapedHtml: string): string {
  // If content is stored as escaped HTML entities, decode once so it renders correctly.
  // If it's already normal HTML, decoding is a no-op for most inputs.
  return decodeHtmlEntities(maybeEscapedHtml || "");
}
