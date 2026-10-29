import { api, apiRequest, setToken } from "./http";
import type {
  LoginResponse,
  MenuDto,
  PurchaseOrderDto,
  PurchaseOrderSaveRequest,
  PurchaseOrderSaveResponse,
  SaveResponse,
} from "./contracts";

/** GET /api/v1/Menus?search= → flat menu rows scoped by the JWT's company/role. */
export function getMenus(search?: string, signal?: AbortSignal) {
  // Background cache fill (TanStack Query) — no global spinner.
  return apiRequest<MenuDto[]>({
    path: api.v1("Menus"),
    query: { search },
    signal,
    showSpinner: false,
  });
}

/* --- Manual screen endpoints ---------------------------------------------- */

/**
 * Generic manual endpoint caller for screen-id controllers
 * (e.g. EN_SYS_MENU_REG_001_Controller). Builds the URL as
 * /api/v1/{controllerPath}?{query} and returns the parsed JSON body.
 *
 * SNOTES convention: each screen calls its own controller via callApi directly
 * — the endpoint lives in the menu file, not a shared endpoints table. Keep the
 * generic helpers above only for genuinely shared resources (sidebar menu tree,
 * company/user lists); new screens should callApi their own controller here.
 */
export function callApi<T = unknown>(
  controllerPath: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    signal?: AbortSignal;
  },
) {
  return apiRequest<T>({
    path: api.v1(controllerPath),
    method: options?.method ?? "GET",
    body: options?.body,
    query: options?.query,
    signal: options?.signal,
  });
}

/* --- Global helpers (SNOTES fnGetDataSet / fnSave / fnLogin / fnLogout) ----- */

/**
 * SNOTES fnGetDataSet — a screen's Search. GET /api/v1/{controller}?{query}.
 * `controller` is the screen-id controller path (or a path with an action
 * suffix like "{Controller}/detail"); `query` holds the search params.
 */
export function fnGetDataSet<T = unknown>(
  controller: string,
  query?: Record<string, string | number | boolean | undefined | null>,
  signal?: AbortSignal,
) {
  return callApi<T>(controller, { query, signal });
}

/**
 * SNOTES fnSave — a screen's Save. POST /api/v1/{controller}/save with a
 * WinForms-style `{ items }` payload (each item carries `state`: I/U/D).
 * Pass `action` to hit a different save route (e.g. "{Controller}/apply").
 */
export function fnSave<T = SaveResponse>(
  controller: string,
  items: unknown,
  options?: { action?: string; signal?: AbortSignal },
) {
  const path = options?.action ? `${controller}/${options.action}` : `${controller}/save`;
  return callApi<T>(path, {
    method: "POST",
    body: { items },
    signal: options?.signal,
  });
}

/** SNOTES fnLogin — POST /api/auth/login. Returns token + user context. */
export function fnLogin(cdCom: string, cdUser: string, password: string) {
  return apiRequest<LoginResponse>({
    path: api.auth("/login"),
    method: "POST",
    body: { cdCom, cdUser, password },
    auth: false,
  });
}

/**
 * SNOTES fnLogout — JWT is stateless so there is no server logout endpoint;
 * sign-out is clearing the local token. Kept as a named helper so screens have
 * a symmetric fnLogin/fnLogout pair.
 */
export function fnLogout() {
  setToken(null);
}

export function getPurchaseOrders(search?: string, signal?: AbortSignal) {
  return apiRequest<PurchaseOrderDto[]>({
    path: api.v1("PurchaseOrders"),
    query: { search },
    signal,
  });
}

export function getPurchaseOrder(cdOrder: string, signal?: AbortSignal) {
  return apiRequest<PurchaseOrderDto>({
    path: api.v1("PurchaseOrders", `/${encodeURIComponent(cdOrder)}`),
    signal,
  });
}

export function savePurchaseOrder(order: PurchaseOrderSaveRequest) {
  return apiRequest<PurchaseOrderSaveResponse>({
    path: api.v1("PurchaseOrders", `/${encodeURIComponent(order.cdOrder)}`),
    method: "PUT",
    body: order,
  });
}

/* Per-entity get/save wrappers were removed: each screen now calls its own
 * controller via fnGetDataSet / fnSave / callApi directly (SNOTES pattern). */
