# Frontend Architecture — ENOTES

## Stack
React + TypeScript + Vite. Use Tailwind CSS utilities in JSX for layout and responsive structure, Material UI for common controls, and focused CSS for global theme tokens and the AG Grid theme/overrides. Keep shared component styles in Tailwind's `@apply` layer only when a semantic selector is needed. Avoid duplicating large screen-specific style systems.

## Component map
```text
App
└── AppShell
    ├── TopBar
    │   └── MainActionToolbar
    ├── Sidebar
    │   ├── MenuSearch
    │   └── MenuTree
    └── Workspace
        ├── TabBar
        └── ActiveTabHost
            └── Feature screen (form/grid/report/split panel)
```

## Suggested folders
```text
src/
├── app/                 # App and shell
├── components/layout/   # TopBar, Sidebar, MenuTree, TabBar, Workspace, toolbar
├── components/ui/       # reusable controls, grid, dialog, split pane
├── features/
│   └── menu/            # menu screens grouped by module and stable screen key
│       └── pur/
│           └── EN_PUR_BAS_REG_001.tsx  # purchase order-type register
├── navigation/          # menu definitions and types
├── tabs/                # tab model and tab manager
├── actions/             # action contract and active-tab dispatcher
├── data/                # mock data
├── styles/              # tokens and global CSS
└── main.tsx
```

## Menu and tab state
Menu entries have stable IDs, labels, folder/screen kind, optional icon, and screen key. A tab has a unique instance ID, screen key, title, and source menu ID. Default policy: one tab per menu/screen key. Keep activeTabId synchronized with the open tabs; after closing the active tab, select a remaining tab predictably.

## Active-tab action dispatch
Use a typed contract, for example:
```ts
export type ScreenAction =
  | "search" | "insert" | "delete"
  | "rowAdded" | "rowDelete"
  | "save" | "print" | "excel";

export type ScreenActionHandler = () => void | Promise<void>;
export type ScreenActionMap = Partial<Record<ScreenAction, ScreenActionHandler>>;
```
Each screen exposes its supported actions and handlers. The shared toolbar resolves the active tab, checks support/enabled state, then invokes only that tab's handler. Keep registrations fresh as callbacks/state change; unregister when tabs close. Avoid stale closures and dispatching to inactive or closed tabs.

## Screen state
Preserve local form/filter/selection state across tab switches. Initially either keep inactive screens mounted or use tab-scoped state; choose the simplest implementation that passes the acceptance criteria and document the choice.

## Future API boundary
When approved, feature screens should call typed API service functions rather than embedding network calls in UI components. The .NET API will own database connectivity and authorization. Never expose a database pooler connection string or service-role secret in frontend code.

## Standard grid architecture
Use AG Grid Community through one shared wrapper at `frontend/src/components/data-grid/`:

```text
frontend/src/components/data-grid/
├── AgDataGrid.tsx       # AgGridReact wrapper and common ENOTES configuration
├── AgDataGrid.css       # ENOTES grid theme and state styles
├── agDataGridTypes.ts   # shared AgColDef column types, AgRow, AgDataGridHandle, props
├── EnDateCellEditor.tsx # shared YYYYMMDD/ISO date cell editor + formatter
└── index.ts             # public exports (AgDataGrid + types)
```

Feature modules own their row types, column definitions (`AgColDef` with `colType`, `lookupOptions`, `precision`, `showFooterSum`), mock/feature data, input validation, value formatting, and callbacks. `AgDataGrid` owns only common AG Grid setup, the `ag-theme-alpine` ENOTES styling, the pinned "No." row-number column, the optional pinned footer-sum row, the shared right-click context menu (Add row / Delete selected row / Save / Export to Excel), and reusable grid-level behavior; it must not contain purchase, sales, inventory, or other business rules. Feature columns should set read-only behavior for identifiers and calculated fields, and use the typed column kinds (`text`, `numeric`, `lookup`, `date`, `datetime`, `checkbox`) for supported values.

The grid library is AG Grid Community, installed as `ag-grid-community` and `ag-grid-react` (both MIT, currently 32.3.9) via `npm install ag-grid-community ag-grid-react`. The React wrapper is `AgGridReact`; the shared wrapper passes `columnDefs` and `rowData` and loads the `ag-theme-alpine` theme plus ENOTES overrides in `AgDataGrid.css`. Verify the installed type declarations for every further prop/event. AG Grid Community is MIT licensed and compatible with this project's React 19 and Vite 8.

### Grid behavior boundaries
- Keep grid actions inside the existing active-tab action contract. The shared top toolbar remains the single global action bar; show Row Added, Row Delete, and Excel only when the active screen supports them. The wrapper also exposes the same add/delete/save/export actions through its built-in right-click context menu when the screen supplies the matching hooks.
- AG Grid Community does not include row grouping (that is an Enterprise feature). Use feature-owned grouping/summary UI or preprocessing when grouping is needed, unless the project explicitly approves an Enterprise license.
- Implement purchase/sales master-detail as an ENOTES-owned master screen with a child/detail grid or panel. Do not describe this as a native grid master-detail workflow.
- Use AG Grid's editing, keyboard navigation, cell text selection, and clipboard behavior. Verify exact React event wiring from the installed types; add custom key handlers only for a documented gap.
- For genuine `.xlsx` export use `write-excel-file/browser` (MIT) with `fflate` (MIT); feature screens already do this. Generate the workbook from explicit feature export columns, keep numeric cells numeric, and exclude internal fields. AG Grid's built-in `.xlsx` export is an Enterprise feature and is not used. CSV is not a substitute for the required `.xlsx` workbook.

Official references: [AG Grid React](https://www.ag-grid.com/react-data-grid/), [getting started](https://www.ag-grid.com/react-data-grid/getting-started/), [cell editing](https://www.ag-grid.com/react-data-grid/cell-editing/), [keyboard navigation](https://www.ag-grid.com/react-data-grid/keyboard-navigation/), [clipboard](https://www.ag-grid.com/react-data-grid/clipboard/), [row grouping (Enterprise)](https://www.ag-grid.com/react-data-grid/grouping/), [licensing](https://www.ag-grid.com/license-and-pricing/), [Excel export (Enterprise)](https://www.ag-grid.com/react-data-grid/excel-export/), and [write-excel-file browser documentation](https://www.npmjs.com/package/write-excel-file).

## Feature screen composition
Place menu-backed screens under `src/features/menu/{module}/{screen_id}.tsx`, preserving the stable screen key in the filename (for example `pur/EN_PUR_BAS_REG_001.tsx`). Each screen owns its SearchPanel fields, screen state, columns, mock data, validation, and event handlers. Render the screen's `SearchPanel` first across the workspace content, followed by its shared `AgDataGrid` or other feature controls. Use the shared `SearchPanelField` to render each field as a separate title on the left and its control on the right, following `docs/images/ENOTES_SAMPLE.jpg`; do not use floating labels inside search inputs for this layout. Use Tailwind utilities for feature layout; keep screen business logic, shared theme variables, and AG Grid theme overrides in the appropriate shared CSS/component layers. Reuse the global `AgDataGrid`; do not create a screen-specific grid component for each menu. Use Material UI for supporting controls such as text fields, selects/autocomplete, dialogs, and icons while retaining the ENOTES shell and grid design.

## Visual theme
Use the shared white, sky-blue, and blue palette in CSS variables and the Material UI theme. Apply the requested 60/30/10 balance as a visual guide: white for the main workspace and component surfaces, light sky blue for supporting regions such as tabs and SearchPanel, and stronger blue for primary actions, selection, and focus. Keep contrast and keyboard focus visible, and avoid applying the grid vendor's default theme across the application.
