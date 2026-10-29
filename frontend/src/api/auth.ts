import { getToken, setToken } from "./http";
import { fnLogin } from "./endpoints";
import type { LoginResponse } from "./contracts";

export type AuthUser = {
  cdCom: string;
  cdUser: string;
  nmUser: string;
  fgRole: string;
};

type JwtPayload = {
  cd_com?: string;
  cd_user?: string;
  nm_user?: string;
  fg_role?: string;
  /** ASP.NET claim URIs fall back when the API uses full claim types. */
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  exp?: number;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

/** Read the current user from the stored JWT (null if absent/expired). */
export function currentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload || isExpired(payload)) {
    if (payload && isExpired(payload)) setToken(null);
    return null;
  }
  return {
    cdCom: payload.cd_com ?? "",
    cdUser: payload.cd_user ?? "",
    nmUser:
      payload.nm_user ??
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      payload.cd_user ??
      "",
    fgRole:
      payload.fg_role ??
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "",
  };
}

/** Authenticate against POST /api/auth/login, store the JWT, return the user. */
export async function signIn(
  cdCom: string,
  cdUser: string,
  password: string,
): Promise<AuthUser> {
  const response: LoginResponse = await fnLogin(cdCom, cdUser, password);
  setToken(response.token);
  return {
    cdCom: response.cdCom,
    cdUser: response.cdUser,
    nmUser: response.nmUser,
    fgRole: response.fgRole,
  };
}

export function signOut() {
  setToken(null);
}
