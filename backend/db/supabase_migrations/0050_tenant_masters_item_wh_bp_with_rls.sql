-- ===== Audit touch (new tables only; legacy tables keep their own triggers) =====
create or replace function app.touch_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.tm_amd := now();
  new.cd_user_amd := auth.uid();
  new.row_version := coalesce(old.row_version, 0) + 1;
  return new;
end
$$;

create table public.mas_item (
  cd_company   varchar(10)  not null references public.mas_company (cd_company) on update cascade,
  cd_item      varchar(30)  not null,
  nm_item      varchar(200) not null,
  fg_type      smallint     not null default 10 check (fg_type in (10,20,30)), -- 10 stock, 20 non-stock, 30 service
  cd_category  varchar(30),
  cd_uom       varchar(10)  not null references public.mas_uom (cd_uom),
  pr_px        numeric(18,6),
  am_cost      numeric(18,6),            -- moving-avg cost maintained by posting (stage 3)
  fl_lot       boolean      not null default false,
  fl_active    boolean      not null default true,
  ext          jsonb,
  tm_reg       timestamptz  not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid         default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer      not null default 1,
  primary key (cd_company, cd_item)
);

create table public.mas_wh (
  cd_company   varchar(10)  not null references public.mas_company (cd_company) on update cascade,
  cd_wh        varchar(20)  not null,
  nm_wh        varchar(100) not null,
  dc_addr      varchar(200),
  fl_active    boolean      not null default true,
  ext          jsonb,
  tm_reg       timestamptz  not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid         default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer      not null default 1,
  primary key (cd_company, cd_wh)
);

create table public.mas_bp (
  cd_company   varchar(10)  not null references public.mas_company (cd_company) on update cascade,
  cd_bp        varchar(20)  not null,
  nm_bp        varchar(200) not null,
  fl_vendor    boolean      not null default false,
  fl_customer  boolean      not null default false,
  no_tax_id    varchar(50),
  no_tel       varchar(30),
  dc_email     varchar(150),
  dc_addr      varchar(200),
  cd_cur       varchar(3)   references public.mas_cur (cd_cur),
  ext          jsonb,
  tm_reg       timestamptz  not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid         default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer      not null default 1,
  primary key (cd_company, cd_bp),
  constraint chk_mas_bp_role check (fl_vendor or fl_customer)
);

create trigger tg_mas_item_touch before update on public.mas_item
  for each row execute function app.touch_audit();
create trigger tg_mas_wh_touch before update on public.mas_wh
  for each row execute function app.touch_audit();
create trigger tg_mas_bp_touch before update on public.mas_bp
  for each row execute function app.touch_audit();

-- Partial indexes: vendor/customer picker lists
create index if not exists ix_mas_bp_vendor   on public.mas_bp (cd_company) where fl_vendor;
create index if not exists ix_mas_bp_customer on public.mas_bp (cd_company) where fl_customer;

alter table public.mas_item enable row level security;
alter table public.mas_wh   enable row level security;
alter table public.mas_bp   enable row level security;

create policy mas_item_select on public.mas_item for select to authenticated
  using (cd_company in (select app.my_companies()));
create policy mas_item_insert on public.mas_item for insert to authenticated
  with check (cd_company in (select app.my_companies()));
create policy mas_item_update on public.mas_item for update to authenticated
  using (cd_company in (select app.my_companies()))
  with check (cd_company in (select app.my_companies()));
create policy mas_item_delete on public.mas_item for delete to authenticated
  using (cd_company in (select app.my_companies()));

create policy mas_wh_select on public.mas_wh for select to authenticated
  using (cd_company in (select app.my_companies()));
create policy mas_wh_insert on public.mas_wh for insert to authenticated
  with check (cd_company in (select app.my_companies()));
create policy mas_wh_update on public.mas_wh for update to authenticated
  using (cd_company in (select app.my_companies()))
  with check (cd_company in (select app.my_companies()));
create policy mas_wh_delete on public.mas_wh for delete to authenticated
  using (cd_company in (select app.my_companies()));

create policy mas_bp_select on public.mas_bp for select to authenticated
  using (cd_company in (select app.my_companies()));
create policy mas_bp_insert on public.mas_bp for insert to authenticated
  with check (cd_company in (select app.my_companies()));
create policy mas_bp_update on public.mas_bp for update to authenticated
  using (cd_company in (select app.my_companies()))
  with check (cd_company in (select app.my_companies()));
create policy mas_bp_delete on public.mas_bp for delete to authenticated
  using (cd_company in (select app.my_companies()));

revoke all on public.mas_item, public.mas_wh, public.mas_bp, public.sys_user_company from anon;
