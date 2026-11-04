-- ===== auth.users <-> company membership bridge (JWT-based tenancy) =====
create table public.sys_user_company (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  cd_company varchar(10) not null references public.mas_company (cd_company) on update cascade on delete cascade,
  role       text        not null default 'member' check (role in ('admin','member')),
  tm_reg     timestamptz not null default now(),
  primary key (user_id, cd_company)
);
alter table public.sys_user_company enable row level security;
create policy sys_user_company_select_own on public.sys_user_company
  for select to authenticated using (user_id = auth.uid());
-- membership WRITES intentionally have no policy: managed via service role / admin flow
create index if not exists ix_sys_user_company_company on public.sys_user_company (cd_company);

-- Tenant helper: evaluated once per query as (select app.my_companies())
-- (owning revision of the auth_rls_initplan fix lives in migration 0060)
create or replace function app.my_companies()
returns setof text
language sql stable security definer
set search_path = ''
as $$
  select suc.cd_company
  from public.sys_user_company suc
  where suc.user_id = auth.uid();
$$;
revoke all on function app.my_companies() from public, anon;
grant execute on function app.my_companies() to authenticated;

-- Starter-kit flow: whoever registers a new company becomes its admin.
-- Legacy .NET inserts (no JWT) must keep working => skip when auth.uid() is null.
create or replace function app.grant_creator_company()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null then
    insert into public.sys_user_company (user_id, cd_company, role)
    values (auth.uid(), new.cd_company, 'admin')
    on conflict (user_id, cd_company) do nothing;
  end if;
  return new;
end
$$;
create trigger tg_mas_company_grant_creator
after insert on public.mas_company
for each row execute function app.grant_creator_company();

-- Company-level access for JWT users (coexists with legacy app.current_company() policies)
create policy mas_company_select_member on public.mas_company
  for select to authenticated using (cd_company in (select app.my_companies()));
create policy mas_company_insert_creator on public.mas_company
  for insert to authenticated with check (true);
create policy mas_company_update_member on public.mas_company
  for update to authenticated
  using (cd_company in (select app.my_companies()))
  with check (cd_company in (select app.my_companies()));
create policy mas_company_delete_member on public.mas_company
  for delete to authenticated using (cd_company in (select app.my_companies()));
