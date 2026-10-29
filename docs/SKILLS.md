# Skills and Engineering Conventions

Use available React/TypeScript best practices and UI/UX design guidance. Inspect the actual skills installed in the current coding environment rather than assuming a particular agent or skill exists.

## React/TypeScript
- Functional components and hooks.
- Typed contracts for menus, tabs, actions, and feature data.
- Stable keys/IDs; focused component responsibilities.
- Keep callback registrations current and clean up when tabs close.
- Avoid stale closures and unnecessary global state.
- Do not add dependencies without a clear reason.

## UI
- Follow `UI_UX.md` and the WinForms reference.
- CSS variables for design tokens.
- Accessible icon buttons, tooltips, keyboard navigation, and visible focus.
- Keep desktop layout compact and practical.
- Use resizable split panels only if keyboard and pointer interaction are usable.

## State and testing
Test tab open/activate/close behavior, existing-menu activation, active-tab-only dispatch, unsupported actions, menu filtering, folder expansion, and state preservation. Run available lint, type-check, tests, and production build.

## Avoid
- Backend implementation during UI-first phase.
- Secrets/connection strings in frontend code.
- Buttons with no action or clear disabled state.
- One giant App component.
- Overengineering an event bus before validating the simple action contract.

## Reusable data grid
- Use the official React integration `ag-grid-react` (with `ag-grid-community`) for ENOTES grids and the shared `frontend/src/components/data-grid/AgDataGrid.tsx` wrapper. The wrapper renders `AgGridReact` with `columnDefs` and `rowData`; verify the installed version's types and API rather than guessing props, events, or component names.
- `ag-grid-community` and `ag-grid-react` are MIT licensed (currently 32.3.9), compatible with this project's React 19.3.1 and Vite 8.3.4. Re-verify the exact package version and complete dependency license tree whenever the grid packages are upgraded.
- AG Grid Community supports inline editing, keyboard navigation, cell selection, and clipboard use. Row grouping, built-in `.xlsx` export, and grouped aggregation are Enterprise features. Do not enable Enterprise functionality or add a paid dependency without explicit approval. CSV is not an `.xlsx` substitute.
- Keep common configuration and ENOTES styling in the wrapper. Feature modules own column definitions, mock/feature data, validation, formatting rules, summary calculations, and callbacks. Keep business rules out of the generic grid component.
- Treat purchase-order and sales detail as an ENOTES composition of a master form and a child grid or detail panel. Describe custom composition accurately; do not call it native grid master-detail.
- For genuine `.xlsx` output, feature screens use `write-excel-file/browser` (MIT) and `fflate` (MIT). Verify the browser download, workbook opening, numeric cell types, omitted internal/sensitive fields, and large-export memory/performance before broad adoption.
- Before broad adoption, validate a realistic mock purchase order: edit and validate cells; test Tab, Enter, arrows, and edit/commit behavior; copy/paste multi-cell data to and from Excel including invalid/read-only cells; demonstrate master-detail composition; demonstrate grouping/summaries and totals; generate and open a real `.xlsx`. Use the installed version and record limitations. Do not report a documented behavior as tested until it has actually been tested.
- Integrate grid actions with the existing shared toolbar and active-tab dispatcher, plus the wrapper's built-in context menu. Keep business screens on mock data until their backend is approved and built; do not embed secrets in frontend code.

Official references: [AG Grid React](https://www.ag-grid.com/react-data-grid/), [getting started](https://www.ag-grid.com/react-data-grid/getting-started/), [cell editing](https://www.ag-grid.com/react-data-grid/cell-editing/), [keyboard navigation](https://www.ag-grid.com/react-data-grid/keyboard-navigation/), [clipboard](https://www.ag-grid.com/react-data-grid/clipboard/), [licensing](https://www.ag-grid.com/license-and-pricing/), and [write-excel-file](https://www.npmjs.com/package/write-excel-file).
