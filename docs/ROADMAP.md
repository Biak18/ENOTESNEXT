# ENOTES Frontend Roadmap

## Phase 0 — Foundation
- [ ] Create React + TypeScript + Vite project.
- [ ] Add docs and CSS tokens.
- [ ] Verify dev server, type-check, and build.

## Phase 1 — Shell
- [ ] Top bar with ENOTES branding and global action icons.
- [ ] Dark sidebar with menu search and expandable tree.
- [ ] Tab strip with activation and close behavior.
- [ ] Workspace and screenshot-inspired compact styling.

**Done when:** shell works with mock menu data.

## Phase 2 — Tabs and action dispatch
- [ ] Typed tab/action contracts.
- [ ] Open screen from menu; activate existing tab by default.
- [ ] Switch and close tabs safely.
- [ ] Implement Search, Insert, Delete, Save, Print, Excel.
- [ ] Support Row Added/Row Delete on relevant screens.
- [ ] Active tab only receives toolbar actions.
- [ ] Unsupported actions hidden/disabled consistently.
- [ ] Preserve screen-local state across tab switches.

**Done when:** with at least three tabs open, actions affect only the selected tab.

## Phase 3 — Menu Register
- [ ] Tree/detail split layout.
- [ ] Local menu-name filter.
- [ ] Fields: Menu Code, Menu Name, Menu Type, Module, Parent Menu, DLL (illustrative).
- [ ] Mock validation and feedback.
- [ ] Resizable divider if practical.

## Phase 4 — AG Grid validation spike
- [ ] Verify the installed React packages `ag-grid-react` and `ag-grid-community` (32.3.9, MIT); confirm they work with the project's React 19.3.1 and Vite 8.3.4 and audit the complete dependency licenses (`scripts/license-audit.mjs`).
- [ ] Build a small prototype with realistic mock purchase-order header and detail data.
- [ ] Test inline editing for supported text, numeric, lookup, and date cells, including validation and read-only/calculated fields.
- [ ] Test Tab, Enter, and arrow-key navigation and editing behavior; record actual behavior for the installed version.
- [ ] Test multi-cell copy/paste from Excel into the grid and from the grid back to Excel, including invalid values and read-only cells (AG Grid Community cell selection/clipboard).
- [ ] Demonstrate the master-detail workflow as a master form plus child grid/detail panel; document the composition accurately (not native master-detail).
- [ ] Demonstrate grouping/summaries with relevant mock fields and quantity/monetary totals. AG Grid Community has no built-in row grouping; use a free preprocessing or application-owned summary approach (e.g. the `showFooterSum` pinned footer row).
- [ ] Generate a genuine `.xlsx` workbook using the free MIT-licensed `write-excel-file` path, open it in Excel-compatible software, and verify headers, values, numeric types, excluded internal/sensitive fields, and reasonable behavior for larger exports. Do not use AG Grid Enterprise export.
- [ ] Verify all added dependencies are free for the intended commercial use and their licenses are acceptable.
- [ ] Record limitations and resolve blocking gaps before adopting the grid across the application.

**Done when:** each required behavior above has been exercised with the prototype, compatibility and licenses are verified, a real `.xlsx` opens with the expected data, and limitations are documented and resolved or explicitly accepted before grid-heavy screens proceed. Documentation alone does not complete this phase.

## Phase 5 — Reusable screen patterns
- [ ] Reusable data grid, form fields, search/filter panel.
- [ ] Mock Purchase Registration and Products screens.
- [ ] Demonstrate detail-grid row add/delete.
- [ ] Empty, loading, error, and confirmation states.

## Phase 6 — Quality
- [ ] Keyboard and accessibility pass.
- [ ] Responsive behavior.
- [ ] Tests for tabs, dispatch, and menu filtering.
- [ ] Lint, type-check, production build.
- [ ] Review screenshot fidelity.

## Future phase — Backend planning (deferred)
Discuss authentication, organization isolation, .NET Core API contracts, PostgreSQL schema, migrations, and deployment only when the user requests backend work. Do not implement this phase now.
