import type { ScreenComponent } from "./screen-contract";
import type { ScreenKey } from "../types";
import { PurchaseOrderTypeRegister } from "./menu/pur/EN_PUR_BAS_REG_001";
import { SalesRegistration } from "./menu/sales/m_sale_reg_001";
import { ProductsScreen } from "./menu/inventory/m_inv_prod_001";
import { MenuRegister } from "./menu/settings/m_sys_menu_001";
import { CompanyRegister } from "./menu/mas/EN_MAS_ORG_REG_001";
import { UserRegister } from "./menu/sys/EN_SYS_BAS_REG_001";
import { MenuRegisterScreen } from "./menu/sys/EN_SYS_MENU_REG_001";
import { CompanyMenuRegister } from "./menu/sys/EN_SYS_AUT_REG_001";
import { RoleMenuRegister } from "./menu/sys/EN_SYS_AUT_REG_002";
import { UserMenuRegister } from "./menu/sys/EN_SYS_AUT_REG_003";

/**
 * Feature screens register here to replace the generic fallback renderer.
 * Each component owns the actions it exposes through its ScreenHandle.
 */
export const screenRegistry: Partial<Record<ScreenKey, ScreenComponent>> = {
  EN_PUR_BAS_REG_001: PurchaseOrderTypeRegister,
  sales: SalesRegistration,
  products: ProductsScreen,
  menus: MenuRegister,

  // MAS / SYS master + authority screens (real API)
  EN_MAS_ORG_REG_001: CompanyRegister,
  EN_SYS_BAS_REG_001: UserRegister,
  EN_SYS_MENU_REG_001: MenuRegisterScreen,
  EN_SYS_AUT_REG_001: CompanyMenuRegister,
  EN_SYS_AUT_REG_002: RoleMenuRegister,
  EN_SYS_AUT_REG_003: UserMenuRegister,
};
