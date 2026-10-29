-- ENOTES seed data
-- Creates the demo company (1000), admin user (1000/1), the menu tree,
-- and the grants that let that user see it via ap_enotes_001_s.
-- Run once in the Supabase SQL editor (or psql). Idempotent-ish: uses
-- ON CONFLICT DO UPDATE/NOTHING so it is safe to re-run.

begin;

-- ---------------------------------------------------------------------------
-- 1) Company
-- ---------------------------------------------------------------------------
insert into public.mas_company (cd_company, nm_company, nm_short, fl_active)
values ('1000', 'Demo Company', 'DEMO', true)
on conflict (cd_company) do update
  set nm_company = excluded.nm_company;

-- ---------------------------------------------------------------------------
-- 2) Admin user  (company 1000 / user 1000 / password "1")
--    dc_password is an ASP.NET Core PasswordHasher<string> hash for "1".
--    Generate a fresh one with: hasher.HashPassword(null, "1")
-- ---------------------------------------------------------------------------
insert into public.sys_user (
  cd_com, cd_user, dc_password, nm_user, dt_reg,
  yn_active, fg_role, tm_reg, cd_user_reg
) values (
  '1000', '1000',
  'AQAAAAIAAYagAAAAECWgvrOBltYCHlhfRNcZHHql+Dc5NpN8I7h5i0dHidKBL0/YvhJBlxz7V1p0tZ/PuQ==',
  'System Administrator', '20260101',
  'Y', 'SUPER_ADMIN', now(), 'SYSTEM'
)
on conflict (cd_com, cd_user) do update
  set dc_password = excluded.dc_password,
      yn_active   = 'Y',
      fg_role     = 'SUPER_ADMIN';

-- ---------------------------------------------------------------------------
-- 3) Menu tree
--    fg_type: 'F' = folder, 'M' = screen (menu item)
--    nm_netwindow / cd_module map a menu row to the React screen key.
--    Order within a parent is driven by no_pos.
-- ---------------------------------------------------------------------------
insert into public.sys_menu (cd_menu, nm_menu, nm_netwindow, fg_type, cd_module, no_pos, cd_menu_parent) values
  -- top-level folders ------------------------------------------------------
  ('M_PUR',        'Purchase',        null, 'F', 'PUR', '0100', null),
  ('M_SAL',        'Sales',           null, 'F', 'SAL', '0200', null),
  ('M_INV',        'Inventory',       null, 'F', 'INV', '0300', null),
  ('M_MAS',        'Master data',     null, 'F', 'MAS', '0400', null),
  ('M_SEC',        'Security',        null, 'F', 'SYS', '0500', null),
  ('M_SYS',        'Settings',        null, 'F', 'SYS', '0900', null),

  -- Purchase ---------------------------------------------------------------
  ('M_PUR_REG_001','Registration',    'purchase',            'M', 'PUR', '0110', 'M_PUR'),
  ('EN_PUR_BAS_REG_001','Order types','EN_PUR_BAS_REG_001',  'M', 'PUR', '0120', 'M_PUR'),
  ('M_PUR_HIS_001','History',         'purchase-history',    'M', 'PUR', '0130', 'M_PUR'),

  -- Sales ------------------------------------------------------------------
  ('M_SAL_REG_001','Registration',    'sales',               'M', 'SAL', '0210', 'M_SAL'),
  ('M_SAL_HIS_001','History',         'sales-history',       'M', 'SAL', '0220', 'M_SAL'),

  -- Inventory --------------------------------------------------------------
  ('M_INV_PROD_001','Products',       'products',            'M', 'INV', '0310', 'M_INV'),
  ('M_INV_STK_001','Stock movements', 'stock',               'M', 'INV', '0320', 'M_INV'),
  ('M_INV_BAL_001','Stock balance',   'balance',             'M', 'INV', '0330', 'M_INV'),

  -- Master data ------------------------------------------------------------
  ('M_MAS_ORG_REG_001','Companies',   'EN_MAS_ORG_REG_001',  'M', 'MAS', '0410', 'M_MAS'),

  -- Security / authority ---------------------------------------------------
  ('M_SYS_BAS_REG_001','Users',       'EN_SYS_BAS_REG_001',  'M', 'SYS', '0510', 'M_SEC'),
  ('M_SYS_MENU_REG_001','Menus',      'EN_SYS_MENU_REG_001', 'M', 'SYS', '0520', 'M_SEC'),
  ('M_SYS_AUT_REG_001','Company menus','EN_SYS_AUT_REG_001', 'M', 'SYS', '0530', 'M_SEC'),
  ('M_SYS_AUT_REG_002','Role menus',  'EN_SYS_AUT_REG_002',  'M', 'SYS', '0540', 'M_SEC'),
  ('M_SYS_AUT_REG_003','User menus',  'EN_SYS_AUT_REG_003',  'M', 'SYS', '0550', 'M_SEC'),

  -- Settings ---------------------------------------------------------------
  ('M_SYS_MENU_001','Menu register',  'menus',               'M', 'SYS', '0910', 'M_SYS')
on conflict (cd_menu) do update
  set nm_menu        = excluded.nm_menu,
      nm_netwindow   = excluded.nm_netwindow,
      fg_type        = excluded.fg_type,
      cd_module      = excluded.cd_module,
      no_pos         = excluded.no_pos,
      cd_menu_parent = excluded.cd_menu_parent;

-- ---------------------------------------------------------------------------
-- 4) Grants — give company 1000 + user 1000 access to every seeded menu.
--    sys_companymenu  (company → menu)
--    sys_usermenu     (company+user → menu, fg_action 'A')
--    sys_rolemenu     (role → menu) — also granted to SUPER_ADMIN so role-based
--                     users see the same tree.
-- ---------------------------------------------------------------------------
insert into public.sys_companymenu (cd_company, cd_menu, tm_reg)
select '1000', cd_menu, now() from public.sys_menu
on conflict (cd_company, cd_menu) do nothing;

insert into public.sys_usermenu (cd_company, cd_user, cd_menu, fg_action, tm_reg)
select '1000', '1000', cd_menu, 'A', now() from public.sys_menu
on conflict (cd_company, cd_user, cd_menu) do nothing;

insert into public.sys_rolemenu (fg_role, cd_menu)
select 'SUPER_ADMIN', cd_menu from public.sys_menu
on conflict (fg_role, cd_menu) do nothing;

commit;
