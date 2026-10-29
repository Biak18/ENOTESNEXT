import { API_BASE_URL, API_VERSION } from "./config";

const TOKEN_KEY = "enotes.auth.token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (SSR/tests) — ignore */
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  /** Relative path, e.g. "/auth/login" or "/v1/Menus". */
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Send the bearer token. Defaults true. */
  auth?: boolean;
  signal?: AbortSignal;
};

/**
 * Thin typed fetch wrapper for the Enotes.Api. Adds the bearer token and the
 * api/v{version} prefix where appropriate. Returns the parsed JSON (or null
 * for 204/empty bodies). Throws ApiError on non-2xx.
 */
export async function apiRequest<T = unknown>({
  path,
  method = "GET",
  body,
  query,
  auth = true,
  signal,
}: RequestOptions): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 204) return null as T;

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    if (response.status === 401) setToken(null);
    throw new ApiError(
      errorMessage(data, response.status),
      response.status,
      data,
    );
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data: unknown, status: number): string {
  // Handle plain string response body (e.g. "Password mismatch for user='1000'...")
  if (typeof data === "string") {
    // If the string looks like HTML (error page), return a friendly message instead
    if (data.includes("<html") || data.includes("<!DOCTYPE")) {
      return friendlyHttpError(status);
    }
    return data;
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    // Common backend error field names — specific messages only
    if (typeof d.message === "string") return d.message;
    if (typeof d.detail === "string") return d.detail;
    if (typeof d.error === "string") return d.error;
    if (typeof d.errorMessage === "string") return d.errorMessage;
    // Skip d.title — ASP.NET ProblemDetails titles are generic ("Unauthorized", etc.)
  }
  return friendlyHttpError(status);
}

/** Map HTTP status codes to user-friendly messages. */
function friendlyHttpError(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Invalid company code, user code, or password.";
    case 403:
      return "Access denied. You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Conflict. The resource already exists or cannot be modified.";
    case 422:
      return "Validation failed. Please check your input and try again.";
    case 429:
      return "Too many requests. Please wait and try again.";
    case 500:
      return "Server error. Please try again later or contact your administrator.";
    case 502:
    case 503:
    case 504:
      return "Server is temporarily unavailable. Please try again later.";
    default:
      return `Request failed (${status})`;
  }
}

/** Convenience builder for a versioned controller path, e.g. api.v1("Menus"). */
export const api = {
  v1: (controller: string, rest = "") => `/api/${API_VERSION}/${controller}${rest}`,
  auth: (rest = "") => `/api/auth${rest}`,
};
