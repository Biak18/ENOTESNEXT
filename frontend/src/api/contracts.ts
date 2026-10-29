/**
 * Contracts matching Enotes.Api JSON payloads (System.Text.Json camelCase).
 */

/** POST /api/auth/login */
export interface LoginRequest {
  cdCom: string;
  cdUser: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  cdCom: string;
  cdUser: string;
  nmUser: string;
  fgRole: string;
}

/** GET /api/v1/Menus → MenuDto[] (flat rows; tree is built client-side). */
export interface MenuDto {
  cdMenu: string;
  nmMenu: string;
  nmNetwindow?: string | null;
  fgType?: string | null;
  cdModule?: string | null;
  noPos?: string | null;
  cdMenuParent?: string | null;
  /** WinForms row-state on save: "I" insert | "U" update | "D" delete. */
  state?: string | null;
}

/** GET /api/v1/Companies */
export interface CompanyDto {
  cdCompany: string;
  nmCompany: string;
  nmShort?: string | null;
  dcImageUrl?: string | null;
  dcAddress1?: string | null;
  dcAddress2?: string | null;
  dcCity?: string | null;
  dcState?: string | null;
  dcPostalCode?: string | null;
  dcCountry?: string | null;
  noPhone?: string | null;
  noFax?: string | null;
  dcEmail?: string | null;
  dcWebsite?: string | null;
  noTaxId?: string | null;
  noRegNo?: string | null;
  flActive: boolean;
  tmReg?: string | null;
  tmAmd?: string | null;
}

/** POST /api/v1/Companies/save */
export interface CompanyItem {
  cdCompany: string;
  nmCompany: string;
  nmShort?: string | null;
  dcImageUrl?: string | null;
  dcAddress1?: string | null;
  dcAddress2?: string | null;
  dcCity?: string | null;
  dcState?: string | null;
  dcPostalCode?: string | null;
  dcCountry?: string | null;
  noPhone?: string | null;
  noFax?: string | null;
  dcEmail?: string | null;
  dcWebsite?: string | null;
  noTaxId?: string | null;
  noRegNo?: string | null;
  flActive: boolean;
  state?: string | null; // "I" | "U" | "D" per the WinForms row-state convention
}

/** GET /api/v1/Users */
export interface UserDto {
  cdCom: string;
  cdUser: string;
  nmUser: string;
  dcEmail?: string | null;
  dcAddress1?: string | null;
  dcAddress2?: string | null;
  noTel?: string | null;
  ynActive: string;
  fgRole?: string | null;
  dtReg: string;
}

/** POST /api/v1/Users/save */
export interface UserItem {
  cdCom: string;
  cdUser: string;
  nmUser: string;
  dcPassword: string;
  /** Sent only for password changes so the backend can verify the current one. */
  dcOldPassword?: string;
  dtReg: string;
  dcEmail?: string | null;
  dcAddress1?: string | null;
  dcAddress2?: string | null;
  noTel?: string | null;
  ynActive: string;
  fgRole?: string | null;
  state?: string | null;
}

/** GET /api/v1/RoleMenus — one row per menu with a checkbox column per role. */
export interface RoleMenuDto {
  cdMenu: string;
  nmMenu: string;
  fgType?: string | null;
  cdModule?: string | null;
  noPos?: string | null;
  cdMenuParent?: string | null;
  employee: boolean;
  teamLead: boolean;
  manager: boolean;
  boss: boolean;
}

/** POST /api/v1/RoleMenus/save */
export interface RoleMenuItem {
  cdMenu: string;
  fgRole: string;
  isAssigned: boolean;
}

/** GET /api/v1/UserMenus?cdCompany=&cdUser= */
export interface UserMenuDto {
  cdCompany: string;
  cdUser: string;
  cdMenu: string;
  nmMenu?: string | null;
  fgAction?: string | null;
}

/** POST /api/v1/UserMenus/save */
export interface UserMenuItem {
  cdUser: string;
  cdMenu: string;
  fgAction?: string | null;
  state?: string | null;
}

/** GET /api/v1/CompanyMenus/{cdCompany} */
export interface CompanyMenuDto {
  cdCompany: string;
  cdMenu: string;
  nmMenu?: string | null;
  isAssigned: boolean;
}

/** POST /api/v1/CompanyMenus/save */
export interface CompanyMenuItem {
  cdMenu: string;
  isAssigned: boolean;
}

/** GET /api/v1/PurchaseOrders → purchase orders with detail lines. */
export interface PurchaseOrderDto {
  cdOrder: string;
  nmSupplier: string;
  dtOrder: string;
  dtExpected?: string | null;
  cdCurrency: string;
  dcReference?: string | null;
  dcNotes?: string | null;
  tmReg: string;
  tmAmd?: string | null;
  lines: PurchaseOrderLineDto[];
}

export interface PurchaseOrderLineDto {
  cdItem: string;
  nmItem: string;
  cdCategory: string;
  cdLocation: string;
  nmUnit: string;
  qtOrder: number;
  amUnitPrice: number;
  amLine: number;
}

/** PUT /api/v1/PurchaseOrders/{cdOrder} */
export interface PurchaseOrderSaveRequest {
  cdOrder: string;
  nmSupplier: string;
  dtOrder: string;
  dtExpected?: string | null;
  cdCurrency: string;
  dcReference?: string | null;
  dcNotes?: string | null;
  lines: PurchaseOrderLineInput[];
}

export interface PurchaseOrderLineInput {
  cdItem: string;
  nmItem: string;
  cdCategory: string;
  cdLocation: string;
  nmUnit: string;
  qtOrder: number;
  amUnitPrice: number;
}

export interface PurchaseOrderSaveResponse {
  cdOrder: string;
  savedLineCount: number;
}

/** POST /api/v1/.../save shared response. */
export interface SaveResponse {
  savedCount: number;
}
