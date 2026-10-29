# Control Development Guide

Build reusable controls with **Material UI (MUI)** for interactive components
and **Tailwind CSS** for layout. Keep each control focused, typed, accessible,
and visually consistent with the compact ENOTES workspace.

## Choosing MUI and Tailwind

- Use MUI components for control behavior and accessibility: `TextField`,
  `Autocomplete`, `Button`, `IconButton`, date pickers, dialogs, and related
  primitives.
- Use Tailwind utilities in JSX for layout, spacing, alignment, and responsive
  structure. Prefer utilities such as `flex`, `min-w-0`, `gap-2`, and `w-full`.
- Use MUI `sx` for styling MUI internals and component states that Tailwind
  cannot target cleanly. Keep these overrides small and local to the control.
- Reuse the shared CSS variables from `src/index.css` for colors. Do not create
  competing palettes, broad global selectors, or per-control design systems.
- Avoid mixing multiple styling mechanisms for the same property. For example,
  use Tailwind for the wrapper's padding and `sx` for the MUI input height.
- Do not add a dependency when MUI or the existing project utilities already
  provide the needed behavior.

## Control conventions

- Keep controls in `src/components/controls/` and export each control from its
  own file. Keep feature-specific business rules in feature screens.
- Define a small props interface. Prefer specific types such as `string`,
  `boolean`, and `React.Ref<HTMLInputElement>` over `any`.
- Use clear controlled or default-value behavior. If a `defaultValue` is
  intended to update after mount, synchronize it deliberately; otherwise
  document that it is only the initial value.
- Expose value changes through typed callbacks. Do not imply that mock/local
  interactions were saved to a server.
- Respect read-only, disabled, required, and editable states consistently.
- Use semantic controls and labels. Give icon-only buttons accessible names,
  preserve keyboard operation, and keep visible focus indicators.
- Keep labels separate from their controls where the screen layout requires it.
  Reuse `SearchPanelField` for SearchPanel rows rather than embedding floating
  labels into search controls.

## Planned control patterns

- **SearchBox**: a search-focused text input, composed from MUI input behavior
  with Tailwind layout. Keep filtering or searching in the owning screen.
- **TextBox**: a reusable text input. A labeled field can compose a label and
  `TextBox`, or use a MUI `TextField` label when that matches the layout.
- **DateBox**: compose the shared `PeriodBox` for date-period entry instead of
  implementing another date-range picker.
- **ComboBox**: use MUI `Autocomplete` for lookup/search selection. Keep lookup
  data and feature-specific filtering outside the generic control.
- **Button**: use MUI `Button` for text actions and `IconButton` for icon-only
  actions; provide an accessible name for icon-only actions.

## SNOTES-inspired EN controls

The `En*.tsx` components adapt the non-grid controls from the local SNOTES
reference into typed ENOTES components. They are prop-driven and do not call
SNOTES services, global popup managers, or hard-coded SNOTES routes. Lookup
controls receive their options and lookup callbacks from the owning screen;
file controls receive upload/download/delete behavior through callbacks.

`EnEditor` is intentionally plain-text only. Rich-text editing, image handling,
and the SNOTES CKEditor setup are not included because that editor dependency
and its licensing/configuration have not been approved for ENOTES.

Import from `src/components/controls` or the local `index.ts` barrel. The
existing controls remain available independently; the `En` prefix avoids
collisions with existing names.
