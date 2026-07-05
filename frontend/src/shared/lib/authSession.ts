export type SessionScope = "customer" | "admin";

export const CUSTOMER_SESSION_COOKIE = "aap-customer-session";
export const ADMIN_SESSION_COOKIE = "aap-admin-session";

type SessionCookieConfig = {
  name: string;
  path: string;
};

const SESSION_COOKIE_CONFIG: Record<SessionScope, SessionCookieConfig> = {
  customer: {
    name: CUSTOMER_SESSION_COOKIE,
    path: "/account",
  },
  admin: {
    name: ADMIN_SESSION_COOKIE,
    path: "/admin",
  },
};

export function isSessionExpiryActive(value: string | undefined | null, now = Date.now()): boolean {
  if (!value) return false;
  const expiresAt = Number(value);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export function syncSessionCookie(scope: SessionScope, expiresAt: number | null, active: boolean): void {
  if (typeof document === "undefined") return;

  const { name, path } = SESSION_COOKIE_CONFIG[scope];
  if (!active || !expiresAt || expiresAt <= Date.now()) {
    document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Strict`;
    return;
  }

  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(String(expiresAt))}; Path=${path}; Max-Age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}