-- ===== Global reference masters (not tenant-scoped). Readable by authenticated only;
-- no write policies => reference data is admin/service-role managed. =====
create table public.mas_cur (
  cd_cur        varchar(3)  primary key,
  nm_cur        varchar(50) not null,
  no_dec        smallint    not null default 2 check (no_dec between 0 and 6),
  fl_active     boolean     not null default true,
  tm_reg        timestamptz not null default now(),
  cd_user_reg   uuid        default auth.uid(),
  row_version   integer     not null default 1
);

create table public.mas_cur_rate (
  cd_cur_from   varchar(3)    not null references public.mas_cur (cd_cur),
  cd_cur_to     varchar(3)    not null references public.mas_cur (cd_cur),
  dt_eff        date          not null,
  rt_ex         numeric(18,8) not null check (rt_ex > 0),
  tm_reg        timestamptz   not null default now(),
  cd_user_reg   uuid          default auth.uid(),
  primary key (cd_cur_from, cd_cur_to, dt_eff),
  constraint chk_cur_rate_distinct check (cd_cur_from <> cd_cur_to)
);
-- rates are immutable effective-dated rows: corrections insert a newer dt_eff, never update old ones

create table public.mas_uom (
  cd_uom        varchar(10) primary key,
  nm_uom        varchar(50) not null,
  fl_active     boolean     not null default true,
  tm_reg        timestamptz not null default now(),
  cd_user_reg   uuid        default auth.uid(),
  row_version   integer     not null default 1
);

create table public.mas_uom_conv (
  cd_uom_from   varchar(10)   not null references public.mas_uom (cd_uom),
  cd_uom_to     varchar(10)   not null references public.mas_uom (cd_uom),
  rt_factor     numeric(18,8) not null check (rt_factor > 0),
  primary key (cd_uom_from, cd_uom_to),
  constraint chk_uom_conv_distinct check (cd_uom_from <> cd_uom_to)
);

-- Plugin registry: contributors add a row here to register a document source type
create table public.mas_src_type (
  cd_src_type   varchar(10) primary key,
  nm_src_type   varchar(80) not null,
  cd_src_table  varchar(60),            -- null when the source is not a document (ADJ)
  fl_active     boolean     not null default true,
  tm_reg        timestamptz not null default now(),
  cd_user_reg   uuid        default auth.uid(),
  row_version   integer     not null default 1
);

-- Direction is derived from io type alone (rule 9): fg_slip lives only here
create table public.mas_io_type (
  cd_io_type    varchar(10) primary key,
  nm_io_type    varchar(80) not null,
  fg_slip       smallint    not null check (fg_slip in (1,2)),  -- 1 in / 2 out
  fl_active     boolean     not null default true,
  tm_reg        timestamptz not null default now(),
  cd_user_reg   uuid        default auth.uid(),
  row_version   integer     not null default 1
);

alter table public.mas_cur        enable row level security;
alter table public.mas_cur_rate   enable row level security;
alter table public.mas_uom        enable row level security;
alter table public.mas_uom_conv   enable row level security;
alter table public.mas_src_type   enable row level security;
alter table public.mas_io_type    enable row level security;

create policy mas_cur_select      on public.mas_cur      for select to authenticated using (true);
create policy mas_cur_rate_select on public.mas_cur_rate for select to authenticated using (true);
create policy mas_uom_select      on public.mas_uom      for select to authenticated using (true);
create policy mas_uom_conv_select on public.mas_uom_conv for select to authenticated using (true);
create policy mas_src_type_select on public.mas_src_type for select to authenticated using (true);
create policy mas_io_type_select  on public.mas_io_type  for select to authenticated using (true);

-- anon gets nothing on new objects (only-expose-what-the-API-needs)
revoke all on public.mas_cur, public.mas_cur_rate, public.mas_uom, public.mas_uom_conv,
              public.mas_src_type, public.mas_io_type from anon;

-- ===== Seed =====
insert into public.mas_cur (cd_cur, nm_cur) values
  ('USD','US Dollar'), ('EUR','Euro'), ('SGD','Singapore Dollar')
on conflict (cd_cur) do nothing;

insert into public.mas_uom (cd_uom, nm_uom) values
  ('EA','Each'), ('KG','Kilogram'), ('BOX','Box')
on conflict (cd_uom) do nothing;

insert into public.mas_src_type (cd_src_type, nm_src_type, cd_src_table) values
  ('PO','Purchase order','pur_poh'),
  ('SO','Sales order','sal_soh'),
  ('ADJ','Inventory adjustment',null),
  ('TRF','Warehouse transfer','mtl_ioh')
on conflict (cd_src_type) do nothing;

insert into public.mas_io_type (cd_io_type, nm_io_type, fg_slip) values
  ('RCPT','Goods receipt',1), ('SHIP','Goods shipment',2),
  ('ADJ_IN','Stock adjustment in',1), ('ADJ_OUT','Stock adjustment out',2),
  ('TRF_IN','Transfer in',1), ('TRF_OUT','Transfer out',2),
  ('PR_RET','Purchase return',2), ('SR_RET','Sales return',1)
on conflict (cd_io_type) do nothing;
