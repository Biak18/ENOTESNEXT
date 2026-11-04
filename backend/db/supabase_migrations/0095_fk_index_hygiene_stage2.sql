create index if not exists ix_pur_pol_uom on public.pur_pol (cd_uom);
create index if not exists ix_sal_sol_uom on public.sal_sol (cd_uom);
create index if not exists ix_pur_poh_cur on public.pur_poh (cd_cur);
create index if not exists ix_sal_soh_cur on public.sal_soh (cd_cur);
