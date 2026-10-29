export type Action = "search" | "insert" | "delete" | "save" | "print" | "excel";
// Screen IDs can be supplied by the future menu API; feature renderers register by key.
export type ScreenKey = string;
export type MenuNode = { id: string; label: string; kind: "folder" | "screen"; screen?: ScreenKey; children?: MenuNode[] };
export type Tab = { id: string; menuId: string; title: string; screen: ScreenKey };
