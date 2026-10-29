/**
 * Base URL for the ENOTES ASP.NET Core API.
 * Set VITE_API_BASE_URL in .env.local (e.g. https://localhost:7xxx) for dev;
 * falls back to same-origin when unset so a production proxy can serve it.
 * Never put secrets or connection strings here.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ??
  "";

export const API_VERSION = "v1";
