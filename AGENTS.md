# ENOTES Frontend — Agent Instructions

## Goal
Move the ENOTES WinForms workflow to a browser-based React application. Preserve the compact desktop ERP feel shown in the user-provided screenshot: dark top bar, searchable tree sidebar, multiple tabs, and a screen workspace.

## Scope now
- Frontend only, using mock data.
- React + TypeScript + Vite.
- Build the shell, menu tree/search, tab manager, shared action toolbar, and sample screens.
- Do not connect Supabase/PostgreSQL or implement the .NET API yet.
- Backend design will be discussed later.

Reference repository: https://github.com/Biak18/ENOTES

## Critical behavior
The toolbar is shared, but every action belongs to the active tab. Search, Insert, Delete, Row Added, Row Delete, Save, Print, and Excel must dispatch only to the active screen's handler. Unsupported actions should be disabled or hidden consistently. Inactive screens must never receive toolbar actions.

## Conventions
- Keep navigation data, tab management, action dispatch, and feature screens separate.
- Use typed TypeScript contracts and stable IDs; never use display labels as IDs.
- Keep screen-local form/filter/selection state associated with its tab.
- Use semantic, keyboard-accessible controls and visible focus styles.
- Centralize styling tokens in CSS variables.
- Avoid unnecessary dependencies and giant components.
- Clearly label mock behavior; never claim a server save occurred.
- Never place database connection strings or secrets in browser code.

## Workflow
Read `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX.md`, and `docs/ROADMAP.md` before implementation. Implement one phase at a time; run available lint, type-check, tests, and production build. Report changed files and verification results.

## Deferred
Authentication, organization isolation, API endpoints, database schema, migrations, production data, and .NET Core API integration are out of scope until separately approved.

## Grid implementation rules
- Read the relevant project documentation, including `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX.md`, `docs/SKILLS.md`, and `docs/ROADMAP.md`, before implementation.
- Use AG Grid Community via the official React package `ag-grid-react` (MIT) as ENOTES's standard data grid. Do not add a competing grid library without approval.
- Verify the selected package version, React/Vite compatibility, API, feature availability, and complete dependency licenses before installation or use. The installed stack is `ag-grid-community`/`ag-grid-react` 32.3.9 on React 19.3.1 and Vite 8.3.4.
- Reuse the shared `frontend/src/components/data-grid/AgDataGrid.tsx` wrapper and its adjacent types/styles (`agDataGridTypes.ts`, `AgDataGrid.css`). Keep business rules, validation, and feature-specific columns in feature modules.
- Test editing, keyboard navigation, clipboard operations, detail workflows, grouping/summaries, and `.xlsx` export in the grid prototype when relevant.
- Never silently replace a required feature with a paid feature or an incomplete approximation. Disclose unsupported capabilities and propose a free alternative before proceeding.
- Do not add AG Grid Enterprise, paid modules, or paid services unless the project explicitly approves the license and cost. Use `ag-grid-community` only.
- Place menu screens under `frontend/src/features/menu/{module}/{screen_id}.tsx`; render a screen's SearchPanel before its content and reuse the shared AgDataGrid.
- Use the shared SearchPanelField for separate left-side titles and right-side controls, matching `docs/images/ENOTES_SAMPLE.jpg`.
- Use Material UI for supporting form controls, dialogs, and icons; follow the shared white/sky-blue/blue 60/30/10 visual palette.
- Use Tailwind CSS utilities in JSX for new layout and responsive styling. Keep shared design tokens and AG Grid theme/CSS overrides in focused CSS; use `@apply` only for shared styles that need a semantic component selector.


