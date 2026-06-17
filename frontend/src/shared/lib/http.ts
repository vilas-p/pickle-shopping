import { config } from "./config";
import type { ApiResponse } from "@/shared/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface HttpOptions extends RequestInit {
  /** Pass-through for Next.js `fetch` revalidation. */
  revalidate?: number | false;
  tags?: string[];
  /** When true, the configured auth token getter is invoked and `Authorization` is set. */
  auth?: boolean;
}

// Auth token resolver. The auth feature will register this on the client at runtime
// via `bindAuthTokenGetter`. Server components run without a token.
let tokenGetter: () => string | null = () => null;

export function bindAuthTokenGetter(fn: () => string | null): void {
  tokenGetter = fn;
}

export async function http<T>(
  path: string,
  { revalidate, tags, auth, headers, ...init }: HttpOptions = {},
): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`;

  const next: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) next.revalidate = revalidate;
  if (tags) next.tags = tags;

  const token = auth ? tokenGetter() : null;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    next: Object.keys(next).length ? next : undefined,
  });

  let body: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string } | null)?.message ?? `Request failed: ${res.status}`;
    throw new ApiError(res.status, msg, body);
  }

  const wrapped = body as ApiResponse<T> | null;
  if (wrapped && typeof wrapped === "object" && "success" in wrapped) {
    if (!wrapped.success) {
      throw new ApiError(res.status, wrapped.message ?? "Unknown error", wrapped);
    }
    return wrapped.data as T;
  }
  return body as T;
}
