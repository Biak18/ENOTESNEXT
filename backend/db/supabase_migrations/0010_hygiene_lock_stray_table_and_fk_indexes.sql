-- Lock the stray helper table (RLS enabled, zero policies => no client access at all)
alter table public.v_pk_params enable row level security;

-- Covering indexes for FKs flagged by the performance advisor
create index if not exists ix_sys_companymenu_menu on public.sys_companymenu (cd_menu);
create index if not exists ix_sys_rolemenu_menu    on public.sys_rolemenu (cd_menu);
create index if not exists ix_sys_usermenu_menu    on public.sys_usermenu (cd_menu);
