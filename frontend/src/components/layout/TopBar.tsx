import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { Autocomplete, IconButton, TextField } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuNode } from "../../types";

type MenuOption = { node: MenuNode; path: string };

function createMenuOptions(
  nodes: MenuNode[],
  parents: string[] = [],
): MenuOption[] {
  return nodes.flatMap((node) => {
    const path = [...parents, node.label];
    const ownOption =
      node.kind === "screen" ? [{ node, path: path.join(" > ") }] : [];
    return [
      ...ownOption,
      ...(node.children ? createMenuOptions(node.children, path) : []),
    ];
  });
}

/** ENOTES header with shell navigation and global menu search. */
export function TopBar({
  activeScreenTitle,
  activeMenuId,
  sidebarCollapsed,
  sidebarWidth,
  menuQuery,
  onMenuQueryChange,
  openMenu,
  onToggleSidebar,
  openDashboard,
  menuItems,
  userName,
  companyCode,
  onLogout,
}: {
  activeScreenTitle?: string;
  activeMenuId?: string;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  menuQuery: string;
  onMenuQueryChange: (query: string) => void;
  openMenu: (node: MenuNode) => void;
  onToggleSidebar: () => void;
  openDashboard: () => void;
  menuItems: MenuNode[];
  userName?: string;
  companyCode?: string;
  onLogout?: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState<MenuOption | null>(null);
  const menuOptions = useMemo(() => createMenuOptions(menuItems), [menuItems]);
  const activePath = useMemo(
    () => menuOptions.find((option) => option.node.id === activeMenuId)?.path,
    [activeMenuId, menuOptions],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (
        event.key === "Escape" &&
        document.activeElement === searchRef.current
      ) {
        onMenuQueryChange("");
        setSearchValue(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onMenuQueryChange]);

  return (
    <header className="topbar">
      <button
        type="button"
        className="brand"
        style={{ width: sidebarCollapsed ? 58 : sidebarWidth }}
        aria-label={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
        aria-expanded={!sidebarCollapsed}
        aria-controls="main-menu-panel"
        title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
        onClick={onToggleSidebar}
      >
        <span className="brand-mark">E</span>
        <span
          className={sidebarCollapsed ? "brand-copy is-hidden" : "brand-copy"}
        >
          ENOTES<small>Business system</small>
        </span>
      </button>
      <div className="header-location">
        <IconButton
          className="home-button"
          aria-label="Open dashboard"
          title="Open dashboard"
          onClick={openDashboard}
          size="small"
        >
          <HomeOutlinedIcon />
        </IconButton>
        <span
          className="header-breadcrumb"
          title={activePath ?? activeScreenTitle}
        >
          {activePath ?? activeScreenTitle ?? "Local workspace"}
        </span>
      </div>
      <div className="header-right">
        <div className="header-search">
          <Autocomplete
            value={searchValue}
            inputValue={menuQuery}
            options={menuOptions}
            filterOptions={(options, state) => {
              const query = state.inputValue.trim().toLocaleLowerCase();
              if (!query) return [];
              return options.filter((option) =>
                option.path.toLocaleLowerCase().includes(query),
              );
            }}
            getOptionLabel={(option) => option.path}
            isOptionEqualToValue={(option, value) =>
              option.node.id === value.node.id
            }
            onChange={(_event, option) => {
              setSearchValue(null);
              if (option) openMenu(option.node);
            }}
            onInputChange={(_event, value, reason) => {
              if (reason === "input" || reason === "clear") {
                onMenuQueryChange(value);
              }
            }}
            noOptionsText="Type to search menus"
            renderOption={(props, option) => (
              <li {...props} key={option.node.id}>
                {option.path}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={searchRef}
                placeholder="Search menu"
                size="small"
                slotProps={{
                  ...params.slotProps,
                  htmlInput: {
                    ...params.slotProps.htmlInput,
                    "aria-label": "Search menu",
                  },
                }}
              />
            )}
            clearOnBlur={false}
            selectOnFocus={false}
            blurOnSelect
            forcePopupIcon={false}
          />
        </div>
        <div className="profile" aria-label="Signed in user">
          <span className="profile-avatar">
            {(userName ?? "?").slice(0, 2).toUpperCase()}
          </span>
          <span className="profile-copy">
            <strong>{userName ?? "Guest"}</strong>
            <small>{companyCode ?? ""}</small>
          </span>
          {onLogout && (
            <IconButton
              aria-label="Sign out"
              title="Sign out"
              size="small"
              onClick={onLogout}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>
    </header>
  );
}
