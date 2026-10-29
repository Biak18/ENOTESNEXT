import type { EnOption } from "../../../components/controls";

/**
 * Purchase Order Type register (mas_potype), mirroring SNOTES SN_PUR_BAS_REG_001.
 * Field names follow the mapper sn_pur_bas_reg_001.xml searchmain select.
 * All data is mock/local until the API exposes a mas_potype endpoint.
 */

export type PoType = {
  /** PO type code — the natural key (cd_po). */
  cd_po: string;
  /** PO type name (nm_po). */
  nm_po: string;
  /** In/out type code (cd_io → mas_iotype). */
  cd_io: string;
  /** Transaction flag (fg_trns): "1" domestic, "2" import. */
  fg_trns: string;
  /** Approval required (yn_app): "Y"/"N". */
  yn_app: string;
  /** Trade (yn_trade): "Y"/"N". */
  yn_trade: string;
  /** Auto requisition (yn_autoreq). */
  yn_autoreq: string;
  /** Auto receive (yn_autorcv). */
  yn_autorcv: string;
  /** Auto purchase (yn_autopur). */
  yn_autopur: string;
  /** Money flag (fg_money). */
  fg_money: string;
  /** Purchase type (tp_pur). */
  tp_pur: string;
  /** In use (yn_use): "Y"/"N". */
  yn_use: string;
  /** Remark (dc_rmk). */
  dc_rmk: string;
  /** U/M flag (fg_um). */
  fg_um: string;
  /** UM-VAT type (tp_um_vat). */
  tp_um_vat: string;
};

export type PoTypeFilters = {
  /** Business division (cd_biz). */
  cdBiz: string;
  /** Free-text search across cd_po / nm_po (str_search). */
  strSearch: string;
};

export const poTypeFilters0: PoTypeFilters = { cdBiz: "", strSearch: "" };

export const cdBizOptions: EnOption[] = [
  { code: "", name: "(All)" },
  { code: "100", name: "Head office" },
  { code: "200", name: "Yangon branch" },
  { code: "300", name: "Mandalay branch" },
];

export const cdIoOptions: EnOption[] = [
  { code: "", name: "(None)" },
  { code: "P10", name: "Purchase receipt" },
  { code: "P20", name: "Purchase return" },
  { code: "P30", name: "Import receipt" },
];

export const trnsOptions: EnOption[] = [
  { code: "1", name: "Domestic" },
  { code: "2", name: "Import" },
];

export const fgMoneyOptions: EnOption[] = [
  { code: "1", name: "Local currency" },
  { code: "2", name: "Foreign currency" },
];

export const tpPurOptions: EnOption[] = [
  { code: "1", name: "General" },
  { code: "2", name: "Subcontract" },
];

export const tpUmVatOptions: EnOption[] = [
  { code: "1", name: "Separate VAT" },
  { code: "2", name: "Inclusive VAT" },
];

export const ynOptions: EnOption[] = [
  { code: "Y", name: "Yes" },
  { code: "N", name: "No" },
];

const ynSet = new Set(ynOptions.map((o) => o.code));

export const initialPoTypes: PoType[] = [
  {
    cd_po: "PO-01",
    nm_po: "Standard purchase order",
    cd_io: "P10",
    fg_trns: "1",
    yn_app: "N",
    yn_trade: "N",
    yn_autoreq: "N",
    yn_autorcv: "N",
    yn_autopur: "N",
    fg_money: "1",
    tp_pur: "1",
    yn_use: "Y",
    dc_rmk: "Default type for routine purchases.",
    fg_um: "1",
    tp_um_vat: "1",
  },
  {
    cd_po: "PO-02",
    nm_po: "Import purchase order",
    cd_io: "P30",
    fg_trns: "2",
    yn_app: "Y",
    yn_trade: "Y",
    yn_autoreq: "Y",
    yn_autorcv: "N",
    yn_autopur: "N",
    fg_money: "2",
    tp_pur: "1",
    yn_use: "Y",
    dc_rmk: "Requires approval; foreign currency.",
    fg_um: "1",
    tp_um_vat: "2",
  },
  {
    cd_po: "PO-03",
    nm_po: "Purchase return",
    cd_io: "P20",
    fg_trns: "1",
    yn_app: "N",
    yn_trade: "N",
    yn_autoreq: "N",
    yn_autorcv: "N",
    yn_autopur: "N",
    fg_money: "1",
    tp_pur: "2",
    yn_use: "N",
    dc_rmk: "Disabled until returns workflow is finalized.",
    fg_um: "1",
    tp_um_vat: "1",
  },
];

export function emptyPoType(cdPo: string): PoType {
  return {
    cd_po: cdPo,
    nm_po: "",
    cd_io: "",
    fg_trns: "1",
    yn_app: "N",
    yn_trade: "N",
    yn_autoreq: "N",
    yn_autorcv: "N",
    yn_autopur: "N",
    fg_money: "1",
    tp_pur: "1",
    yn_use: "Y",
    dc_rmk: "",
    fg_um: "1",
    tp_um_vat: "1",
  };
}

export function filterPoTypes(rows: PoType[], filters: PoTypeFilters): PoType[] {
  const search = filters.strSearch.trim().toLowerCase();
  return rows.filter((row) => {
    if (search) {
      const hay = `${row.cd_po} ${row.nm_po}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    // cdBiz is a real filter in the mapper but our mock rows don't carry cd_biz,
    // so a chosen division narrows nothing here; left in place for the API.
    void filters.cdBiz;
    return true;
  });
}

export function validatePoTypeField(field: keyof PoType, raw: unknown): { ok: true; value: string } | { ok: false; message: string } {
  const value = String(raw ?? "").trim();
  switch (field) {
    case "cd_po":
      if (!value) return { ok: false, message: "Type code is required." };
      if (value.length > 6) return { ok: false, message: "Type code cannot exceed 6 characters." };
      return { ok: true, value };
    case "nm_po":
      if (!value) return { ok: false, message: "Type name is required." };
      if (value.length > 60) return { ok: false, message: "Type name cannot exceed 60 characters." };
      return { ok: true, value };
    case "yn_app":
    case "yn_trade":
    case "yn_autoreq":
    case "yn_autorcv":
    case "yn_autopur":
    case "yn_use":
      if (!ynSet.has(value)) return { ok: false, message: "Choose Y or N." };
      return { ok: true, value };
    default:
      return { ok: true, value };
  }
}

export function validatePoType(row: PoType): string | null {
  const code = validatePoTypeField("cd_po", row.cd_po);
  if (!code.ok) return code.message;
  const name = validatePoTypeField("nm_po", row.nm_po);
  if (!name.ok) return name.message;
  return null;
}
