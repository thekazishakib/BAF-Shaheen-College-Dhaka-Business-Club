// ─────────────────────────────────────────────────────────────
// sanitizeUrl.ts — Safe URL helper
//
// SECURITY: Prevents javascript: / data: / vbscript: URL injection.
// Any dynamic URL coming from Firestore (authorLinkedIn,
// authorPortfolio, registrationLink, eCertLink, etc.) MUST be
// passed through sanitizeUrl() before being placed in an href or
// passed to window.open().
//
// Allowed schemes: https, http (http redirects should be fine
// since target="_blank" + rel="noopener noreferrer" is used).
// Everything else is blocked and returns '' (empty = no link).
// ─────────────────────────────────────────────────────────────

const ALLOWED_SCHEMES = ['https:', 'http:'];

/**
 * Returns the URL unchanged if it uses an allowed scheme,
 * or '' if the URL is empty, malformed, or uses a dangerous scheme.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_SCHEMES.includes(parsed.protocol)) return '';
    return trimmed;
  } catch {
    // Not a valid absolute URL
    return '';
  }
}
