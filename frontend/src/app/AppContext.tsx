import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MenuNode } from "../types";
import { currentUser, signIn, signOut, type AuthUser } from "../api/auth";
import { getMyMenus } from "../api/endpoints";
import { mapMenuDtoToNodes, mapMenuTitles } from "../api/menuMapper";

export type AppContextValue = {
  user: AuthUser | null;
  /** Bumped on every successful login — sessions never share workspace state. */
  session: number;
  menuItems: MenuNode[];
  screenTitles: Record<string, string>;
  loadingMenu: boolean;
  apiOnline: boolean;
  login: (cdCom: string, cdUser: string, password: string) => Promise<void>;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => currentUser());
  const [session, setSession] = useState(1);
  const queryClient = useQueryClient();

  // Server state via TanStack Query: cached, deduplicated, retried, and
  // refetched in the background on refocus. The key includes the company so a
  // different login always fetches its own tree.
  const menuQuery = useQuery({
    queryKey: ["menus", user?.cdCom ?? null],
    queryFn: ({ signal }) => getMyMenus(undefined, signal),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // sidebar is fresh for 5 min, no refetch spam
  });

  const menuItems = useMemo(
    () => (user && menuQuery.data ? mapMenuDtoToNodes(menuQuery.data) : []),
    [user, menuQuery.data],
  );
  const screenTitles = useMemo(
    () => (user && menuQuery.data ? mapMenuTitles(menuQuery.data) : {}),
    [user, menuQuery.data],
  );
  const loadingMenu = !!user && menuQuery.isPending;
  const apiOnline = !user || !menuQuery.isError;

  const login = useCallback(
    async (cdCom: string, cdUser: string, password: string) => {
      const authUser = await signIn(cdCom, cdUser, password);
      setUser(authUser);
      // New session id → the keyed workspace remounts fresh for this login.
      setSession((n) => n + 1);
    },
    [],
  );

  const logout = useCallback(() => {
    signOut();
    setUser(null);
    // Drop the cached menu so the next login re-fetches cleanly.
    queryClient.removeQueries({ queryKey: ["menus"] });
  }, [queryClient]);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      session,
      menuItems,
      screenTitles,
      loadingMenu,
      apiOnline,
      login,
      logout,
    }),
    [user, session, menuItems, screenTitles, loadingMenu, apiOnline, login, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

