# UI/UX Specification — ENOTES Web

## Reference
Use the user-provided WinForms screenshot and existing repo (https://github.com/Biak18/ENOTES) as references. Match a compact desktop ERP, not a generic dashboard.

## Main layout
1. **Top bar:** dark navy, ENOTES branding, global action icons, optional organization/user context.
2. **Left sidebar:** dark background; “Search menu” input; folder tree and document/screen items.
3. **Tab strip:** compact tabs below the top bar; active state and close icons.
4. **Workspace:** light neutral surface for the active screen.
5. **Split panels:** support a resizable vertical divider for screens such as Menu Register.

The reference screenshot places Search, Insert, Delete, Save, and Print in the dark top bar. Keep that placement for the first prototype. Row Added/Row Delete may appear when the active screen has an editable detail grid; Excel is available when export is supported. Do not duplicate the same actions in two toolbars.

## Sidebar behavior
- Search filters labels and preserves parent hierarchy for matching descendants.
- Folder clicks expand/collapse; screen clicks open or activate a tab.
- Clicking a menu already open activates the existing tab by default.
- Provide hover, selected, expanded, and keyboard-focus states.
- Sidebar may collapse at narrower widths.

## Tabs
- Compact desktop-style tabs.
- Active tab clearly distinguished.
- Accessible close buttons.
- Closing active tab selects another open tab; no stale active ID.
- Preserve per-tab state where feasible.
- Do not silently discard dirty form state if dirty-state tracking exists.

## Toolbar
Search, Insert, Delete, Row Added, Row Delete, Save, Print, Excel. Use icon buttons with accessible names/tooltips. Show or disable actions according to the active screen's capabilities. Disable repeated clicks during async actions; confirm destructive actions. Only the active screen's handler may run.

## Sample screen: Menu Register
- Local Menu Name search field.
- Menu tree/list on the left.
- Details form on the right with illustrative fields: Menu Code, Menu Name, Menu Type, Module, Parent Menu, DLL.
- Mock data only. This is a UI example, not a finalized backend schema.
- The global Search action invokes this screen's own search behavior; it is distinct from the local text field.

## Styling and accessibility
Use dark navy navigation, light workspace, subtle borders, compact controls, and blue active/focus accents. Centralize colors, spacing, typography, and borders as CSS variables. Avoid oversized cards, excessive whitespace, and decorative gradients. Ensure keyboard access, visible focus, accessible labels for icon-only buttons, and sufficient contrast. Browser window controls belong to the browser, not the app.

## Data grids
Use AG Grid through the shared `frontend/src/components/data-grid/AgDataGrid.tsx` wrapper. Keep the existing navy toolbar, searchable left menu, tabbed workspace, and active-tab action dispatcher. Grid actions belong in the shared toolbar when supported by the active screen; do not add a second grid-only toolbar (the wrapper's right-click context menu may mirror those same actions).

- Style the grid in `AgDataGrid.css` (over the `ag-theme-alpine` base) to match ENOTES typography, spacing, colors, and subtle borders. Do not apply its default theme as the application-wide design.
- Make editable, read-only, selected, focused, and invalid cells visually distinct. Preserve a clear accessible focus indicator.
- Choose practical row heights and column widths for business data. Format quantities, prices, and totals consistently without changing the underlying numeric values.
- Keep the grid usable at normal desktop ERP resolutions. Allow horizontal scrolling or suitable column sizing when all business columns cannot fit.
- Provide consistent loading, empty, error, and validation feedback around the grid.
- Preserve native grid keyboard behavior for Tab, Enter, and arrow keys; avoid handlers that intercept those keys without a demonstrated need.
- Show Row Added, Row Delete, and Excel toolbar actions only when the active screen supports them.
- Avoid animation and decoration that distract from rapid data entry.
