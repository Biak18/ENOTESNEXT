import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MenuNode } from "../types";
import { currentUser, signIn, signOut, type AuthUser } from "../api/auth";
import { getMenus } from "../api/endpoints";
import { mapMenuDtoToNodes, mapMenuTitles } from "../api/menuMapper";

export type AppContextValue = {
  user: AuthUser | null;
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
  const [menuItems, setMenuItems] = useState<MenuNode[]>([]);
  const [screenTitles, setScreenTitles] = useState<Record<string, string>>({});
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  const loadMenu = useCallback(async (signal?: AbortSignal) => {
    setLoadingMenu(true);
    try {
      const rows = await getMenus(undefined, signal);
      setMenuItems(mapMenuDtoToNodes(rows));
      setScreenTitles(mapMenuTitles(rows));
      setApiOnline(true);
    } catch (error) {
      // Menu fetch failing (offline/401) shouldn't blank the UI; keep defaults.
      setApiOnline(false);
      console.error("Failed to load menu tree:", error);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // Load the menu tree once a user is authenticated (and reload on login).
  useEffect(() => {
    if (!user) {
      setMenuItems([]);
      setScreenTitles({});
      return;
    }
    const controller = new AbortController();
    void loadMenu(controller.signal);
    return () => controller.abort();
  }, [user, loadMenu]);

  const login = useCallback(
    async (cdCom: string, cdUser: string, password: string) => {
      const authUser = await signIn(cdCom, cdUser, password);
      setUser(authUser);
    },
    [],
  );

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      menuItems,
      screenTitles,
      loadingMenu,
      apiOnline,
      login,
      logout,
    }),
    [user, menuItems, screenTitles, loadingMenu, apiOnline, login, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
