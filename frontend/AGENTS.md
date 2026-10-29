# Frontend Menu Development Rules

- Before implementing a menu screen, read the repository guidance and [ADDING_A_MENU.md](./docs/ADDING_A_MENU.md).
- Add stable menu IDs and screen keys in `src/navigation/menu.ts`. Keep menu labels separate from screen keys.
- Put each menu-backed screen in `src/features/menu/{module}/{screen_id}.tsx`, then register it by screen key in `src/features/screenRegistry.ts`.
- Keep screen-specific UI and behavior in its feature module. Do not add per-menu conditions to `App.tsx` or menu-specific UI branches to `ScreenContent.tsx`.
- Expose supported actions on the screen's `ScreenHandle`; the shared toolbar dispatches only to the active tab. Do not add global Row Added or Delete Row actions.
- Put row controls inside the feature screen. Use the shared `SearchPanel`, `SearchPanelField`, and `DataGrid`; use MUI for supporting controls and Tailwind for layout.
- Keep this phase frontend-only with mock data. Do not add APIs, database schemas, authentication, or secrets.
- Never silently substitute a paid feature or an incomplete approximation for a required capability. Explain unsupported behavior and propose a free alternative.
- Verify the new menu's tab behavior, active-tab actions, keyboard access, responsive layout, and run `npm run lint` and `npm run build`.
