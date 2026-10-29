# Adding a menu screen

Use this checklist when adding a new screen to the ENOTES menu. Menu-backed screens stay in their own feature module; the app shell owns tabs and dispatches only the active screen's actions.

## 1. Add a stable menu entry

Edit `src/navigation/menu.ts` and add a `MenuNode` under the appropriate module folder in `menuItems`:

```ts
{
  id: "inventory-adjustment",
  label: "Adjustment",
  kind: "screen",
  screen: "inventory-adjustment",
}
```

Use a unique, stable `id` and `screen` key. Keep the display label separate from both keys. Add a `screenTitles` entry only when the tab title should differ from the menu label. For a new module, add a folder node with its own stable ID and put the screen node in its `children`.

## 2. Create the feature screen

Create the component under `src/features/menu/{module}/{screen_id}.tsx`, using the legacy screen identifier in the filename when one exists. Keep that screen's mock data, columns, validation, and event callbacks in the feature module. Do not add menu-specific rendering or `screen === ...` branches to `App.tsx` or the generic `ScreenContent.tsx`.

The component should accept `ScreenProps` and expose its supported actions through the shared `ScreenHandle` contract:

```tsx
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";

export const InventoryAdjustment = forwardRef<ScreenHandle, ScreenProps>(
  function InventoryAdjustment({ notify }, ref) {
    const searchRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      search: () => searchRef.current?.focus(),
      save: () => notify("Adjustment saved in this local demo."),
    }), [notify]);

    return (
      <section className="flex min-h-0 flex-1 flex-col">
        {/* Put this screen's SearchPanel first, then its form or shared DataGrid. */}
      </section>
    );
  },
);
```

Expose only actions the screen actually supports: `search`, `insert`, `delete`, `save`, `print`, or `excel`. The global toolbar reads these methods from the active tab's handle, so adding a screen does not require adding a screen-name condition to the toolbar. Do not expose row add/delete actions in the global toolbar; put detail-row controls within the screen when that workflow needs them.

## 3. Register the screen component

Import the feature component in `src/features/screenRegistry.ts` and map it by its stable `screen` key:

```ts
import type { ScreenComponent } from "../screen-contract";
import type { ScreenKey } from "../types";
import { InventoryAdjustment } from "./menu/inventory/m_inv_adj_001";

export const screenRegistry: Partial<Record<ScreenKey, ScreenComponent>> = {
  "inventory-adjustment": InventoryAdjustment,
};
```

The existing `TabScreen` resolves the screen key through this registry. The menu label becomes the tab label by default; `screenTitles` can override it.

## 4. Build the screen with shared controls

- Render a `SearchPanel` first when the screen has search conditions, using `SearchPanelField` for the title-plus-control layout.
- Use the shared `DataGrid` for tabular data. Define feature-specific columns, row types, validation, and callbacks beside the feature screen.
- Use Material UI for supporting inputs, comboboxes, dialogs, and icons. Use Tailwind utilities for layout and keep ENOTES styles consistent with the shared palette.
- Use realistic mock data only in this frontend phase. Do not add API calls, database schemas, authentication, or secrets.
- Preserve local tab state and provide clear empty, validation, and loading feedback as applicable.

## 5. Verify the integration

- Confirm the new menu opens one tab and selecting it again activates that same tab.
- Confirm closing the tab returns focus to another open tab and the screen's state is retained while switching tabs.
- Confirm every toolbar action affects only the active tab and unsupported actions are absent.
- Confirm keyboard focus, responsive layout, and the SearchPanel/grid fit the workspace.
- Run `npm run lint` and `npm run build`.
