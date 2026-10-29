# Product Requirements — ENOTES Web

## Vision
ENOTES will become a browser-based business management system usable by different organizations, including shops, restaurants, and other businesses. Provide standard modules; client-specific menu/workflow customization can be scoped separately.

## First milestone
Create a faithful, usable frontend prototype using mock data. Preserve the existing desktop ERP workflow instead of designing a conventional card-heavy website.

## Layout
- **Top bar:** ENOTES branding and shared action icons: Search, Insert, Delete, Save, Print, Excel; include Row Added/Row Delete when relevant.
- **Sidebar:** dark panel, “Search menu” input, expandable folders, and openable menu entries.
- **Tab strip:** several open screens, active-tab indicator, close controls.
- **Workspace:** active screen content; support forms, grids, reports, and split tree/detail layouts.
- **Screen state:** filters, selected rows, and unsaved form values should persist while switching tabs where feasible.

## Toolbar contract
The toolbar is shared, but actions are resolved against the active tab only. Each screen declares supported actions and handlers. Search on Purchase searches purchases; Search on Products searches products. Switching tabs changes which handler runs. Unsupported actions are disabled or hidden. Destructive actions should confirm before deletion.

## Standard menu examples
Dashboard; Purchase (Registration, History); Sales (Registration, History); Inventory (Products, Stock Movements, Stock Balance); Contacts (Customers, Suppliers); Finance; Reports; Settings. These are examples, not a finalized menu contract.

## Out of scope
No real login, API calls, database, tenant authorization, real persistence, or finalized business rules. Future direction is React frontend + .NET Core Web API + PostgreSQL via a server-side pooler connection string, but backend design is deferred.

## Acceptance criteria
- Search filters menu names and keeps parent context visible.
- Folders expand/collapse.
- At least three screens can be open in tabs.
- Selecting an already-open menu activates its tab rather than duplicating it by default.
- Tabs switch and close safely.
- Toolbar actions invoke only the active tab's handler.
- Unsupported actions are represented consistently.
- Screen-local state survives tab switching.
- UI is usable at common desktop sizes and keyboard accessible.
- Demo behavior is clearly identified as mock/local only.

## Standard data-grid requirements
AG Grid Community is the standard grid library for ENOTES. Use its official React package, `ag-grid-react` (with `ag-grid-community`), through the shared wrapper in `frontend/src/components/data-grid/` (`AgDataGrid.tsx`). The React wrapper renders `AgGridReact` with `columnDefs` and `rowData`; verify the current API and installed package types before coding. Feature columns use the shared `AgColDef` type (`colType`, `lookupOptions`, `precision`, `showFooterSum`).

The current app uses React 19 and Vite 8. `ag-grid-community`/`ag-grid-react` 32.3.9 are installed, MIT licensed, and compatible with this stack.

### Grid acceptance criteria
- Feature screens provide typed column definitions, mock data, validation, and callbacks to the reusable `AgDataGrid`; shared grid configuration and visual integration stay in the wrapper.
- Supported cells edit inline using appropriate text, numeric, lookup (select), date/datetime, or checkbox editors produced from `colType`. Validate before accepting edits. Identifiers, calculated values, and other read-only fields cannot be edited.
- Keyboard entry is practical: verify Tab, Enter, arrows, edit start/commit/cancel, and focus behavior against the installed AG Grid version. Keep its native behavior; add custom key handlers only for a documented gap that does not conflict.
- Multi-cell copy/paste supports tabular data. Verify Excel-to-grid paste and grid-to-Excel copy, including invalid values and read-only cells, using AG Grid Community's cell selection and clipboard support; validate exact behavior in the installed version.
- Purchase and sales documents use an ENOTES-owned master form plus a child detail grid or detail panel. This is an application composition; do not call it native master-detail support.
- AG Grid Community does not include row grouping (that is Enterprise). Implement ENOTES grouping and totals in feature-owned preprocessing or summary UI, and use the wrapper's pinned footer-sum row (`showFooterSum`) for column totals, without a paid plugin.
- Excel export downloads a genuine `.xlsx` workbook, not CSV renamed as `.xlsx`. Preserve headers and numeric values, omit internal/sensitive fields, and handle large datasets within browser memory limits. AG Grid's built-in `.xlsx` export is an Enterprise feature and is not used; features generate workbooks with the free MIT-licensed `write-excel-file`. Verify browser download, opened workbook, full dependency licenses, and size/performance before broad adoption.
- The grid remains visually integrated with ENOTES and usable at normal desktop ERP sizes. Loading, empty, error, validation, selected, read-only, and focus states are clear and accessible.

### AG Grid licensing boundary
`ag-grid-community` and `ag-grid-react` are MIT licensed. Current official docs identify inline editing, keyboard navigation, cell selection, and clipboard use in Community. Row grouping, built-in `.xlsx` export, and grouped aggregation are Enterprise features. Do not use any Enterprise feature without approval. For details and current verification links, see [ARCHITECTURE.md](ARCHITECTURE.md), [SKILLS.md](SKILLS.md), and [ROADMAP.md](ROADMAP.md).
