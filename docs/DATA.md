# Frontend Data Contracts — ENOTES

This file describes frontend types and mock data only. It is not the database schema or an API contract.

## Menu model
```ts
export type MenuItemKind = "folder" | "screen";

export interface MenuItem {
  id: string;
  label: string;
  kind: MenuItemKind;
  icon?: string;
  parentId?: string;
  children?: MenuItem[];
  screenKey?: string;
}
```
Use stable IDs rather than labels. A screen item has a `screenKey`; folders are expandable.

## Tab model
```ts
export interface OpenTab {
  id: string;          // unique open-tab instance ID
  screenKey: string;   // screen component/type
  title: string;       // visible label
  menuItemId?: string; // source menu item
}
```
Default: one tab per screen/menu. Add multi-instance behavior deliberately if later required.

## Action contract
```ts
export type ScreenAction =
  | "search" | "insert" | "delete"
  | "rowAdded" | "rowDelete"
  | "save" | "print" | "excel";

export type ScreenActionHandler = () => void | Promise<void>;
export type ScreenActionMap = Partial<Record<ScreenAction, ScreenActionHandler>>;
```
Examples: a report may support Search, Print, Excel; a purchase form may support most actions. Exact capabilities belong to each screen.

## State ownership
Keep form values, selected rows, filters, and dirty state associated with the relevant screen/tab. Avoid one shared global form object or an untyped `any` state bag.

## Mock behavior
- Search filters local mock data or shows a demo result.
- Insert opens an empty form or adds a temporary local item.
- Delete confirms and updates only local demo state.
- Save must say it is a local/demo save, not a database save.
- Print/Excel may show “not implemented in this prototype” until built.
- Never imply server persistence or API success without a backend.
