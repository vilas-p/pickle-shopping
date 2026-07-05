export function sanitizeRedirectTarget(input: string | null | undefined, fallback: string): string {
  if (!input) return fallback;

  const value = input.trim();
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) {
    return fallback;
  }

  return value;
}