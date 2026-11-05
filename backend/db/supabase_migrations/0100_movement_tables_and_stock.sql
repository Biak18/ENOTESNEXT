-- ===== Inventory movements (header/lines) + stock ledger =====
-- no_doc auto-assigned by the generic trigger: MTL<yyyymmdd><seq>
-- st_status: 10 draft -> 20 posted (engine only) | 10 -> 99 cancelled.
-- Posted movements are immutable; corrections are new opposite movements (reverse_io).

create table public.mtl_ioh (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  st_status    smallint      not null default 10 check (st_status in (10,20,99)),
  cd_io_type   varchar(10)   not null,
  dt_io        date          not null default current_date,
  cd_src_type  varchar(10),
  cd_src_doc   varchar(24),
  dc_ref       varchar(60),
  dc_note      varchar(500),
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc),
  foreign key (cd_company) references public.mas_company (cd_company) on update cascade,
  foreign key (cd_io_type) references public.mas_io_type (cd_io_type),
  foreign key (cd_src_type) references public.mas_src_type (cd_src_type)
);

create table public.mtl_iol (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  no_line      integer       not null,
  cd_item      varchar(30)   not null,
  nm_item      varchar(200)  not null,
  cd_wh        varchar(20)   not null,      -- warehouse affected (out: source, in: destination)
  cd_uom       varchar(10)   not null,
  qt           numeric(18,6) not null check (qt > 0 and qt <= 999999999),
  pr_px        numeric(18,6) not null check (pr_px >= 0 and pr_px <= 999999999999),
  am           numeric(18,2) not null check (am = round(qt * pr_px, 2)),
  cd_src_line  integer,                     -- source document line (pur_pol/sal_sol no_line)
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc, no_line),
  foreign key (cd_company, no_doc) references public.mtl_ioh (cd_company, no_doc) on update cascade on delete cascade,
  foreign key (cd_company, cd_item) references public.mas_item (cd_company, cd_item),
  foreign key (cd_company, cd_wh) references public.mas_wh (cd_company, cd_wh),
  foreign key (cd_uom) references public.mas_uom (cd_uom)
);

-- Stock ledger: engine-only writes. pr_avg = moving average cost (base currency).
create table public.mtl_stock (
  cd_company  varchar(10)   not null,
  cd_item     varchar(30)   not null,
  cd_wh       varchar(20)   not null,
  qt_onhand   numeric(18,6) not null default 0 check (qt_onhand >= 0),
  pr_avg      numeric(18,6) not null default 0 check (pr_avg >= 0),
  tm_amd      timestamptz   not null default now(),
  primary key (cd_company, cd_item, cd_wh),
  foreign key (cd_company, cd_item) references public.mas_item (cd_company, cd_item),
  foreign key (cd_company, cd_wh) references public.mas_wh (cd_company, cd_wh)
);

-- Movement guard. Engine marker = app.engine session flag (set by posting RPCs only).
create or replace function app.io_guard()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status smallint;
  v_engine boolean := coalesce(current_setting('app.engine', true), '') = 'on';
  v_comp   text := coalesce(new.cd_company, old.cd_company);
  v_doc    text := coalesce(new.no_doc, old.no_doc);
begin
  if tg_table_name = 'mtl_iol' then
    select st_status into v_status from public.mtl_ioh
     where cd_company = v_comp and no_doc = v_doc;
    if v_status is null then
      raise exception 'movement % has no header', v_doc;
    end if;
    if v_status <> 10 then
      raise exception 'lines are immutable once the movement is posted/cancelled (status %)', v_status;
    end if;
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'INSERT' then
    if new.st_status <> 10 then
      raise exception 'new movements must start as draft (status 10)';
    end if;
    return new;

  elsif tg_op = 'DELETE' then
    if old.st_status <> 10 then
      raise exception 'only draft movements can be deleted (status %)', old.st_status;
    end if;
    return old;

  else
    if new.cd_company is distinct from old.cd_company or new.no_doc is distinct from old.no_doc
       or new.cd_io_type is distinct from old.cd_io_type
       or new.cd_src_type is distinct from old.cd_src_type
       or new.cd_src_doc is distinct from old.cd_src_doc then
      raise exception 'cd_company/no_doc/cd_io_type/cd_src_* are immutable';
    end if;

    if new.st_status is distinct from old.st_status then
      if old.st_status = 10 and new.st_status = 20 and v_engine then return new; end if;
      if old.st_status = 10 and new.st_status = 99 then return new; end if;
      raise exception 'status transition % -> % not allowed (10 draft -> 20 posted by engine, or 10 -> 99 cancelled)', old.st_status, new.st_status;
    end if;

    if old.st_status <> 10 then
      raise exception 'posted/cancelled movements are immutable (status %)', old.st_status;
    end if;
    return new;
  end if;
end
$$;

create trigger tg_mtl_ioh_number before insert on public.mtl_ioh
  for each row execute function app.assign_doc_no();
create trigger tg_mtl_ioh_guard before insert or update or delete on public.mtl_ioh
  for each row execute function app.io_guard();
create trigger tg_mtl_iol_guard before insert or update or delete on public.mtl_iol
  for each row execute function app.io_guard();
create trigger tg_mtl_ioh_touch before update on public.mtl_ioh
  for each row execute function app.touch_audit();
create trigger tg_mtl_iol_touch before update on public.mtl_iol
  for each row execute function app.touch_audit();

create index if not exists ix_mtl_ioh_io_type on public.mtl_ioh (cd_io_type);
create index if not exists ix_mtl_ioh_src_type on public.mtl_ioh (cd_src_type);
create index if not exists ix_mtl_ioh_src on public.mtl_ioh (cd_company, cd_src_type, cd_src_doc);
create index if not exists ix_mtl_ioh_date on public.mtl_ioh (cd_company, dt_io);
create index if not exists ix_mtl_ioh_open on public.mtl_ioh (cd_company, st_status) where st_status = 10;
create index if not exists ix_mtl_iol_item on public.mtl_iol (cd_company, cd_item);
create index if not exists ix_mtl_iol_wh on public.mtl_iol (cd_company, cd_wh);
create index if not exists ix_mtl_iol_uom on public.mtl_iol (cd_uom);
create index if not exists ix_mtl_stock_wh on public.mtl_stock (cd_company, cd_wh);

alter table public.mtl_ioh enable row level security;
alter table public.mtl_iol enable row level security;
alter table public.mtl_stock enable row level security;

create policy mtl_ioh_select on public.mtl_ioh for select to authenticated using (cd_company in (select app.my_companies()));
create policy mtl_ioh_insert on public.mtl_ioh for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy mtl_ioh_update on public.mtl_ioh for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy mtl_ioh_delete on public.mtl_ioh for delete to authenticated using (cd_company in (select app.my_companies()));

create policy mtl_iol_select on public.mtl_iol for select to authenticated using (cd_company in (select app.my_companies()));
create policy mtl_iol_insert on public.mtl_iol for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy mtl_iol_update on public.mtl_iol for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy mtl_iol_delete on public.mtl_iol for delete to authenticated using (cd_company in (select app.my_companies()));

-- stock: readable by members, writable by the engine only
create policy mtl_stock_select on public.mtl_stock for select to authenticated using (cd_company in (select app.my_companies()));

revoke all on public.mtl_ioh, public.mtl_iol, public.mtl_stock from anon;
revoke insert, update, delete on public.mtl_stock from authenticated;
grant select on public.mtl_stock to authenticated;
