# ENOTES Frontend Documentation Package

This package describes a UI-first React migration of the ENOTES WinForms workflow.

## Contents
- `AGENTS.md` — coding-agent instructions
- `docs/PRD.md` — product requirements
- `docs/ARCHITECTURE.md` — component and active-tab action architecture
- `docs/UI_UX.md` — screenshot-inspired layout and behavior
- `docs/DATA.md` — frontend-only types and mock-data rules
- `docs/SKILLS.md` — engineering conventions and checks
- `docs/ROADMAP.md` — phased implementation
- `docs/SECURITY.md` — frontend and future API security boundaries

## Scope
Frontend only for now: React + TypeScript + Vite, mock data, no database/API integration. Backend planning is deferred.

## Placement
Extract the package into the root of the ENOTES web frontend repository and keep the `docs/` folder.

## Standard data grid
AG Grid Community is the standard data-grid library for ENOTES. The official React package is `ag-grid-react` (with `ag-grid-community`); use the shared `AgDataGrid` wrapper described in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Do not add another grid library without approval.

`ag-grid-community` and `ag-grid-react` are MIT licensed (currently 32.3.9). AG Grid's row grouping and built-in `.xlsx` export are Enterprise features. ENOTES must not adopt paid modules without explicit approval; grouping and totals are done in feature-owned UI/preprocessing, and `.xlsx` export uses the MIT-licensed `write-excel-file` browser package with its MIT-licensed `fflate` dependency. The dependency audit currently reports no vulnerabilities. Browser download behavior and generated workbook compatibility still need interactive verification.

The current frontend uses React 19 and Vite 8. The installed AG Grid packages are compatible with this stack; verify behavior in feature screens and keep the shared wrapper as the single integration point. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Current scope
The frontend remains UI-first and mock-data-only. Do not implement authentication, APIs, database access, or production persistence as part of the grid work. For the grid requirements and confirmed limitations, see [docs/PRD.md](docs/PRD.md), [docs/UI_UX.md](docs/UI_UX.md), and [docs/SKILLS.md](docs/SKILLS.md).
