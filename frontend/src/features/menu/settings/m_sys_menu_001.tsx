import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import TextField from "@mui/material/TextField";
import ComboBox from "../../../components/controls/Combobox";
import SearchBox from "../../../components/controls/SearchBox";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import {
  filterMenus,
  initialMenus,
  menuTypeOptions,
  moduleOptions,
  validateMenu,
  type MenuEntry,
} from "./menuData";

export const MenuRegister = forwardRef<ScreenHandle, ScreenProps>(
  function MenuRegister({ searchRef }, ref) {
    const [menus, setMenus] = useState<MenuEntry[]>(initialMenus);
    const [filter, setFilter] = useState("");
    const [selectedCode, setSelectedCode] = useState(initialMenus[0].code);
    const [draft, setDraft] = useState<MenuEntry>(initialMenus[0]);
    const [formDirty, setFormDirty] = useState(false);

    const visibleMenus = useMemo(() => filterMenus(menus, filter), [menus, filter]);
    const parentOptions = useMemo(
      () => ["вЂ”", ...menus.map((menu) => menu.name)],
      [menus],
    );

    const selectMenu = useCallback(
      (code: string) => {
        setSelectedCode(code);
        const next = menus.find((menu) => menu.code === code);
        if (next) {
          setDraft(next);
          setFormDirty(false);
        }
      },
      [menus],
    );

    const updateDraft = useCallback((patch: Partial<MenuEntry>) => {
      setDraft((current) => ({ ...current, ...patch }));
      setFormDirty(true);
    }, []);

    const focusSearch = useCallback(() => {
      searchRef.current?.focus();
      showEnDialog("info", "Search menu items by code, name, or module.")
    }, [searchRef]);

    const insert = useCallback(() => {
      const nextCode = `MN-${String(50 + menus.length).padStart(3, "0")}`;
      const fresh: MenuEntry = {
        code: nextCode,
        name: "",
        type: "Screen",
        module: "General",
        parent: "вЂ”",
        dll: "",
      };
      setDraft(fresh);
      setSelectedCode("");
      setFormDirty(true);
      showEnDialog("info", "New menu details are ready to edit.")
    }, [menus.length]);

    const remove = useCallback(async () => {
      if (!selectedCode) {
        showEnDialog("info", "Select a saved menu entry to delete.")
        return;
      }
      if (
        !(await showEnConfirm(`Delete ${draft.name || "this menu"} from the local demo?`))
      ) {
        return;
      }
      const remaining = menus.filter((menu) => menu.code !== selectedCode);
      setMenus(remaining);
      const next = remaining[0];
      if (next) {
        setSelectedCode(next.code);
        setDraft(next);
      } else {
        setSelectedCode("");
        setDraft({
          code: "",
          name: "",
          type: "Screen",
          module: "General",
          parent: "вЂ”",
          dll: "",
        });
      }
      setFormDirty(false);
      showEnDialog("info", "Menu entry deleted from local demo data.")
    }, [draft.name, menus, selectedCode]);

    const save = useCallback(() => {
      const problem = validateMenu(draft);
      if (problem) {
        showEnDialog("error", problem);
        return;
      }
      setMenus((items) =>
        selectedCode
          ? items.map((item) => (item.code === selectedCode ? draft : item))
          : [...items, draft],
      );
      setSelectedCode(draft.code);
      setFormDirty(false);
      showEnDialog("info", "Menu details saved locally in this demo.")
    }, [draft, selectedCode]);

    useImperativeHandle(
      ref,
      () => ({
        search: focusSearch,
        insert,
        delete: remove,
        save,
        canClose: async () =>
          !formDirty ||
          (await showEnConfirm("Discard unsaved changes in this menu draft?")) === true,
      }),
      [focusSearch, formDirty, insert, remove, save],
    );

    return (
      <div className="feature-screen menu-register">
        <div className="register-toolbar">
          <div className="screen-filter" style={{ display: "flex" }}>
            <SearchBox
              value={filter}
              onValueChanged={setFilter}
              inputRef={searchRef}
              placeholder="Search menu name"
              showSearchIcon
              clearable
              className="min-w-0 flex-1 sm:py-0"
              bordered={false}
            />
          </div>
          <span>{visibleMenus.length} entries</span>
        </div>
        <div className="register-split">
          <div className="register-list" role="listbox" aria-label="Menu items">
            <div className="register-list-title">
              MENU ITEMS <span>{visibleMenus.length}</span>
            </div>
            {visibleMenus.map((item) => (
              <button
                key={item.code}
                className={`register-row ${item.code === selectedCode ? "selected" : ""}`}
                onClick={() => selectMenu(item.code)}
                role="option"
                aria-selected={item.code === selectedCode}
              >
                <span className="screen-icon">в–§</span>
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.code} В· {item.module}
                  </small>
                </span>
              </button>
            ))}
            {visibleMenus.length === 0 && (
              <p className="empty-hint">No matching menus.</p>
            )}
          </div>
          <div className="register-details">
            <div className="form-section-title">
              <div>
                <h2>Menu details</h2>
                <p>Illustrative navigation settings for this local prototype.</p>
              </div>
              <span className="draft-state">
                {selectedCode ? "Selected entry" : "New entry"}
              </span>
            </div>
            <div className="form-grid menu-fields">
              <label>
                Menu Code
                <TextField
                  size="small"
                  value={draft.code}
                  onChange={(event) => updateDraft({ code: event.target.value })}
                />
              </label>
              <label>
                Menu Name
                <TextField
                  size="small"
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  placeholder="Enter menu name"
                />
              </label>
              <label>
                Menu Type
                <ComboBox
                  options={menuTypeOptions}
                  value={draft.type || null}
                  onValueChanged={(type) => updateDraft({ type: type ?? "Screen" })}
                  clearable={false}
                  className="!py-0"
                />
              </label>
              <label>
                Module
                <ComboBox
                  options={moduleOptions}
                  value={draft.module || null}
                  onValueChanged={(module) =>
                    updateDraft({ module: module ?? "General" })
                  }
                  clearable={false}
                  className="!py-0"
                />
              </label>
              <label>
                Parent Menu
                <ComboBox
                  options={parentOptions}
                  value={draft.parent || null}
                  onValueChanged={(parent) => updateDraft({ parent: parent ?? "вЂ”" })}
                  clearable={false}
                  className="!py-0"
                />
              </label>
              <label>
                DLL / Screen key
                <TextField
                  size="small"
                  value={draft.dll}
                  onChange={(event) => updateDraft({ dll: event.target.value })}
                  placeholder="Optional screen identifier"
                />
              </label>
            </div>
            <div className="register-footnote">
              This menu register is mock data. Saving updates this tab only.
            </div>
          </div>
        </div>
      </div>
    );
  },
);


