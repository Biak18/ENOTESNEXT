import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { EnComboBox, EnTextBox } from "../../../components/controls";
import {
  EnTreeView,
  type EnTreeViewHandle,
  type TreeNode,
} from "../../../components/tree";
import { EnSplitter } from "../../../components/splitter";
import EnSharedForm from "../../../widgets/EnSharedForm";
import type {
  EnFormField,
  EnFormHandle,
  EnFormValue,
} from "../../../widgets/EnFormTypes";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { fnGetDataSet, fnSave } from "../../../api/endpoints";
import type { MenuDto, SaveResponse } from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import { useQueryClient } from "@tanstack/react-query";

const typeOptions = [
  { code: "F", name: "Folder" },
  { code: "M", name: "Menu" },
];

// This screen's own backend controller (SNOTES: each menu owns its endpoint).
const CONTROLLER = "EN_SYS_MENU_REG_001";

type MenuRow = MenuDto & { __new?: boolean };

/** Strip the local `__new` flag before sending a row to the API / form. */
function toMenuDto(row: MenuRow): MenuDto {
  return {
    cdMenu: row.cdMenu,
    nmMenu: row.nmMenu,
    nmNetwindow: row.nmNetwindow,
    fgType: row.fgType,
    cdModule: row.cdModule,
    noPos: row.noPos,
    cdMenuParent: row.cdMenuParent,
  };
}

function buildTree(rows: MenuRow[]): TreeNode<MenuRow>[] {
  const byId = new Map<string, TreeNode<MenuRow>>();
  const roots: TreeNode<MenuRow>[] = [];
  for (const r of rows) {
    byId.set(r.cdMenu, {
      id: r.cdMenu,
      label: r.nmMenu,
      children: [],
      data: r,
    });
  }
  for (const r of rows) {
    const node = byId.get(r.cdMenu)!;
    const parent = r.cdMenuParent ? byId.get(r.cdMenuParent) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  const sortRec = (nodes: TreeNode<MenuRow>[]) => {
    nodes.sort((a, b) =>
      (a.data?.noPos ?? "").localeCompare(b.data?.noPos ?? ""),
    );
    nodes.forEach((n) => sortRec(n.children ?? []));
  };
  sortRec(roots);
  // Drop empty folders that came from the server — but keep freshly-added
  // (`__new`) folders so they stay visible until the user fills them in.
  const prune = (nodes: TreeNode<MenuRow>[]) =>
    nodes.filter(
      (n) => n.children!.length || n.data?.fgType !== "F" || n.data?.__new,
    );
  return prune(roots);
}

/**
 * Menu register (sys_menu) — mirrors M_SYS_MENU_REG_001.
 * A hierarchical menu tree + focused-node detail form, saved via
 * POST /api/v1/Menus/save. Real API.
 */
export const MenuRegisterScreen = forwardRef<ScreenHandle, ScreenProps>(
  function MenuRegisterScreen({ searchRef }, ref) {
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [search, setSearch] = useState("");
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const deletedIds = useRef<Set<string>>(new Set());
    const queryClient = useQueryClient();
    // Codes of saved rows the user edited through the form (→ "U" on save).
    const changedIds = useRef<Set<string>>(new Set());
    const treeRef = useRef<EnTreeViewHandle>(null);

    const focused = useMemo(
      () => rows.find((r) => r.cdMenu === focusedId) ?? null,
      [rows, focusedId],
    );

    const load = useCallback(async () => {
      try {
        const data = await fnGetDataSet<MenuDto[]>(CONTROLLER, {
          search: search || undefined,
        });
        setRows(data);
        deletedIds.current.clear();
        changedIds.current.clear();
        setDirty(false);
      } catch (e) {
        await showEnDialog(
          "error",
          e instanceof ApiError ? e.message : "Failed to load menus.",
        );
      }
    }, [search]);

    const tree = useMemo(() => buildTree(rows), [rows]);

    // A node id queued for tree focus once it exists in the rendered tree.
    const pendingFocus = useRef<string | null>(null);
    useEffect(() => {
      if (!pendingFocus.current) return;
      if (
        !tree.some(function has(n: TreeNode<MenuRow>): boolean {
          return (
            n.id === pendingFocus.current || (n.children?.some(has) ?? false)
          );
        })
      )
        return;
      const id = pendingFocus.current;
      pendingFocus.current = null;
      treeRef.current?.selectAndFocus(id);
    }, [tree]);

    // Toolbar Search re-runs the query (SNOTES onSearch), not just focus.
    const onSearch = useCallback(() => {
      void load();
    }, [load]);

    const addNode = useCallback(
      (asChild: boolean) => {
        const parentId = asChild && focused ? focused.cdMenu : null;
        if (asChild && focused?.fgType !== "F") {
          showEnDialog("error", "Select a folder to add a child menu.");
          return;
        }
        // Root-level insert always creates a folder (the module group), since a
        // top-level "menu" with no screen is just a container.
        const base = parentId ?? "MENU";
        const cd = `${base}_${String(rows.length + 1).padStart(3, "0")}`;
        // SNOTES no_pos: parent's position + a 3-digit sibling sequence, so the
        // new row sorts under its parent (e.g. "0110" → "0110001").
        const siblings = rows.filter((r) => r.cdMenuParent === parentId);
        const seq = String(siblings.length + 1).padStart(3, "0");
        const noPos = `${focused?.noPos ?? ""}${seq}`;
        const node: MenuRow = {
          cdMenu: cd,
          nmMenu: "New menu",
          nmNetwindow: "",
          fgType: asChild ? "M" : "F",
          cdModule: focused?.cdModule ?? "",
          noPos,
          cdMenuParent: parentId,
          __new: true,
        };
        setRows((current) => [...current, node]);
        setFocusedId(cd);
        setDirty(true);
        // Reveal + focus the new node once it's in the rendered tree (the
        // effect above fires after `rows`/`tree` update).
        pendingFocus.current = cd;
        // showEnDialog(
        //   "success",
        //   `Added ${asChild ? "child menu" : "root folder"} ${cd}.`,
        // );
      },
      [focused, rows],
    );

    const deleteFocused = useCallback(async () => {
      if (!focused) {
        showEnDialog("error", "Select a menu node to remove.");
        return;
      }
      if (
        focused.fgType === "F" &&
        rows.some((r) => r.cdMenuParent === focused.cdMenu)
      ) {
        showEnDialog("error", "Delete this folder's children first.");
        return;
      }
      if (
        !(await showEnConfirm(
          `Remove menu "${focused.nmMenu}" (${focused.cdMenu})?`,
        ))
      )
        return;
      setRows((current) => current.filter((r) => r.cdMenu !== focused.cdMenu));
      if (!focused.__new) deletedIds.current.add(focused.cdMenu);
      setFocusedId(null);
      setDirty(true);
      // showEnDialog("success", `Menu ${focused.cdMenu} removed.`);
    }, [focused, rows]);

    const updateField = useCallback(
      (field: keyof MenuDto, value: string) => {
        if (!focusedId) return;
        if (field === "cdMenu") {
          // Renaming the key: re-point the focused id and every child's parent.
          const next = value.trim();
          setRows((current) =>
            current.map((r) => {
              if (r.cdMenu === focusedId) return { ...r, cdMenu: next };
              if (r.cdMenuParent === focusedId)
                return { ...r, cdMenuParent: next };
              return r;
            }),
          );
          setFocusedId(next || null);
        } else {
          setRows((current) =>
            current.map((r) =>
              r.cdMenu === focusedId ? { ...r, [field]: value } : r,
            ),
          );
        }
        // Editing a previously-saved row marks it for an update; new rows are
        // already "I" via __new so they don't need tracking here.
        if (focused && !focused.__new) changedIds.current.add(focusedId);
        setDirty(true);
      },
      [focused, focusedId],
    );

    const save = useCallback(async () => {
      for (const r of rows) {
        if (!r.cdMenu?.trim()) {
          showEnDialog("error", "Every menu needs a code.");
          return;
        }
        if (!r.nmMenu?.trim()) {
          showEnDialog("error", `Menu ${r.cdMenu} needs a name.`);
          return;
        }
        if (r.fgType === "M" && !r.nmNetwindow?.trim()) {
          showEnDialog(
            "error",
            `Menu ${r.cdMenu} needs a screen (nm_netwindow).`,
          );
          return;
        }
      }
      // Reject duplicate codes — sys_menu's key is cd_menu.
      const seen = new Set<string>();
      for (const r of rows) {
        const c = r.cdMenu.trim();
        if (seen.has(c)) {
          showEnDialog("error", `Duplicate menu code "${c}".`);
          return;
        }
        seen.add(c);
      }
      // Build the save payload: only rows that actually changed, each tagged
      // with its WinForms row-state for the backend SaveMenu handler.
      const items: MenuDto[] = rows
        .filter((r) => r.__new || changedIds.current.has(r.cdMenu))
        .map((r) => ({ ...toMenuDto(r), state: r.__new ? "I" : "U" }));
      const deleted: MenuDto[] = [...deletedIds.current].map((cdMenu) => ({
        cdMenu,
        nmMenu: "",
        state: "D",
      }));
      const payload = [...items, ...deleted];
      if (!payload.length) {
        showEnDialog("success", "No changes to save.");
        return;
      }
      try {
        const res = await fnSave<SaveResponse>(CONTROLLER, payload);
        // Persisted: drop the local new/changed/deleted markers.
        setRows((current) => current.map((r) => ({ ...r, __new: false })));
        setDirty(false);
        changedIds.current.clear();
        deletedIds.current.clear();
        // Sidebar menu tree is server state — refresh it in the background.
        void queryClient.invalidateQueries({ queryKey: ["menus"] });
        await showEnDialog(
          "success",
          `Successfully saved ${res.savedCount ?? payload.length} menu row${res.savedCount === 1 ? "" : "s"}.`,
        );
      } catch (e) {
        await showEnDialog(
          "error",
          e instanceof ApiError ? e.message : "Save failed.",
        );
      }
    }, [rows, queryClient]);

    // Folders the focused row can sit under — excludes itself and its own
    // descendants so you can't make a folder its own ancestor.
    const folderOptions = useMemo(() => {
      const descendants = new Set<string>();
      if (focused) {
        const collect = (id: string) => {
          descendants.add(id);
          rows.forEach((r) => {
            if (r.cdMenuParent === id) collect(r.cdMenu);
          });
        };
        collect(focused.cdMenu);
      }
      return [
        { code: "", name: "(root)" },
        ...rows
          .filter((r) => r.fgType === "F" && !descendants.has(r.cdMenu))
          .map((r) => ({ code: r.cdMenu, name: `${r.cdMenu} — ${r.nmMenu}` })),
      ];
    }, [rows, focused]);

    // --- Shared-form binding (SNOTES SharedForm pattern) ----------------------
    const formFields = useMemo<EnFormField[]>(
      () => [
        // Menu code is editable on a newly-inserted row, then locked once the
        // row is saved (SNOTES dc_editcon "new" condition).
        {
          id: "cdMenu",
          label: "Menu code",
          required: true,
          readOnly: !focused?.__new,
        },
        { id: "nmMenu", label: "Menu name", required: true },
        { id: "fgType", label: "Type", type: "select", options: typeOptions },
        { id: "cdModule", label: "Module" },
        {
          id: "nmNetwindow",
          label: "Screen (nm_netwindow)",
          placeholder: "e.g. EN_SAL_REG_001",
        },
        { id: "noPos", label: "Position" },
        {
          id: "cdMenuParent",
          label: "Parent",
          type: "select",
          options: folderOptions,
        },
      ],
      [focused?.__new, folderOptions],
    );
    const formRef = useRef<EnFormHandle>(null);

    // The detail form is always mounted (no empty placeholder); it binds the
    // focused row and resets to blank when the focus is cleared.
    useEffect(() => {
      formRef.current?.setFormData(
        focused
          ? (toMenuDto(focused) as unknown as Record<string, EnFormValue>)
          : {},
      );
    }, [focused]);

    const handleFormValueChanged = useCallback(
      (fieldId: string, value: EnFormValue) => {
        updateField(fieldId as keyof MenuDto, String(value ?? ""));
      },
      [updateField],
    );

    // Toolbar Insert: folder focused → child menu under it; otherwise → a new
    // root folder (e.g. the "SAL" module group). Code is editable on new rows.
    const insert = useCallback(
      () => addNode(focused?.fgType === "F"),
      [addNode, focused?.fgType],
    );

    useImperativeHandle(
      ref,
      () => ({
        search: onSearch,
        insert,
        delete: deleteFocused,
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved menu changes?")) === true,
      }),
      [deleteFocused, dirty, insert, onSearch, save],
    );

    return (
      <div className="feature-screen po-prototype bg-white">
        <SearchPanel ariaLabel="Menu search conditions">
          <SearchPanelField title="Menu name" htmlFor="menu-search">
            <EnTextBox
              defaultValue={search}
              onValueChanged={setSearch}
              placeHolderText="Menu code or name"
              inputRef={searchRef}
              isSearchPanel
            />
          </SearchPanelField>
          <SearchPanelField title="Type" htmlFor="menu-type">
            <EnComboBox
              defaultValue=""
              options={[{ code: "", name: "(All)" }, ...typeOptions]}
              onValueChanged={() => {}}
              isSearchPanel
            />
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 pt-3">
          <EnSplitter
            orientation="vertical"
            initial={55}
            min={25}
            max={75}
            className="min-h-0 flex-1"
          >
            {/* Pane 1 — tree */}
            <div
              className="flex min-h-0 flex-1 flex-col"
              style={{
                background: "#ffffff",
                borderRadius: 4,
                overflow: "hidden",
                padding: "4px 4px 8px",
              }}
            >
              <div className="min-h-0 flex-1 overflow-auto">
                <EnTreeView<MenuRow>
                  ref={treeRef}
                  nodes={tree}
                  variant="form"
                  defaultExpandedDepth={1}
                  ariaLabel="Menu hierarchy"
                  selectedId={focusedId}
                  onSelect={(node) => setFocusedId(node.id)}
                />
              </div>
            </div>

            {/* Pane 2 — detail (shared form is always visible) */}
            <section
              aria-label="Menu detail"
              style={{
                background: "#ffffff",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {/* Slim status strip — keeps the badge clear of form fields. */}
              <div
                style={{
                  flex: "none",
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "8px 12px 0",
                }}
              >
                <span className="draft-state">
                  {dirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              <div className="min-h-0 min-w-0 flex-1 overflow-auto">
                <EnSharedForm
                  ref={formRef}
                  fields={formFields}
                  columns={2}
                  onValueChanged={handleFormValueChanged}
                />
              </div>
            </section>
          </EnSplitter>
        </div>
      </div>
    );
  },
);
