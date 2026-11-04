# Frontend Menu Development Rules

- Before implementing a menu screen, read the repository guidance and [ADDING_A_MENU.md](./docs/ADDING_A_MENU.md).
- Add stable menu IDs and screen keys in `src/navigation/menu.ts`. Keep menu labels separate from screen keys.
- Put each menu-backed screen in `src/features/menu/{module}/{screen_id}.tsx`, then register it by screen key in `src/features/screenRegistry.ts`.
- Keep screen-specific UI and behavior in its feature module. Do not add per-menu conditions to `App.tsx` or menu-specific UI branches to `ScreenContent.tsx`.
- Expose supported actions on the screen's `ScreenHandle`; the shared toolbar dispatches only to the active tab. Do not add global Row Added or Delete Row actions.
- Put row controls inside the feature screen. Use the shared `SearchPanel`, `SearchPanelField`, and `DataGrid`; use MUI for supporting controls and Tailwind for layout.
- Use mock data when an endpoint is not available or the task explicitly calls for it. Screens may consume existing authenticated API endpoints; do not connect directly to databases or add backend endpoints without approval.
- For API-backed menu screens, route searches through `fetchDataset` from `src/api/query.ts` rather than calling endpoint helpers directly from Search handlers. Pass search criteria as the query object, and use `cacheScope` for company- or user-scoped data so cached results do not cross authenticated scopes. This is client-side cache isolation, not authorization.
- After a successful mutation, call `invalidateDataset` for that controller so the next Search fetches fresh data.
- Never silently substitute a paid feature or an incomplete approximation for a required capability. Explain unsupported behavior and propose a free alternative.
- Verify the new menu's tab behavior, active-tab actions, keyboard access, responsive layout, and run `npm run lint` and `npm run build`.
