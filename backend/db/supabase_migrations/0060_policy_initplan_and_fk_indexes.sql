-- Performance advisor: auth_rls_initplan - evaluate auth.uid() once per statement
drop policy if exists sys_user_company_select_own on public.sys_user_company;
create policy sys_user_company_select_own on public.sys_user_company
  for select to authenticated using ((select auth.uid()) = user_id);

-- Performance advisor: covering indexes for the 5 unindexed FKs
create index if not exists ix_mas_item_uom    on public.mas_item     (cd_uom);
create index if not exists ix_mas_bp_cur      on public.mas_bp       (cd_cur);
create index if not exists ix_mas_uom_conv_to on public.mas_uom_conv (cd_uom_to);
create index if not exists ix_mas_cur_rate_to on public.mas_cur_rate (cd_cur_to);
create index if not exists ix_mas_company_cur on public.mas_company  (cd_cur_base);
