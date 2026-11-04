-- ===== PURCHASE / SALES document tables =====
-- One naming decision for reuse: every document header carries no_doc (uniform column
-- name enables the single numbering trigger + generic guard). Screen labels map
-- no_doc -> "PO No." / "SO No." contextually.
-- st_status: 10 draft -> 20 confirmed -> 90 closed(engine) / 99 cancelled.
-- qt_io: received/shipped so far; writable ONLY by the posting engine (guard enforced).
-- am = round(qt * pr_px, 2) enforced by CHECK. rt_ex frozen at document date (rule 6).

create table public.pur_poh (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  st_status    smallint      not null default 10 check (st_status in (10,20,90,99)),
  cd_bp        varchar(20)   not null,
  dt_doc       date          not null default current_date,
  dt_expect    date,
  cd_cur       varchar(3)    not null,
  rt_ex        numeric(18,8) not null check (rt_ex > 0),
  dc_ref       varchar(60),
  dc_note      varchar(500),
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc),
  foreign key (cd_company, cd_bp) references public.mas_bp (cd_company, cd_bp),
  foreign key (cd_company) references public.mas_company (cd_company) on update cascade,
  foreign key (cd_cur) references public.mas_cur (cd_cur),
  constraint chk_pur_poh_date check (dt_expect is null or dt_expect >= dt_doc)
);

create table public.pur_pol (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  no_line      integer       not null,
  cd_item      varchar(30)   not null,
  nm_item      varchar(200)  not null,   -- name snapshot for history
  cd_wh        varchar(20)   not null,
  cd_uom       varchar(10)   not null,   -- base uom in v1
  qt           numeric(18,6) not null check (qt > 0 and qt <= 999999999),
  pr_px        numeric(18,6) not null check (pr_px >= 0 and pr_px <= 999999999999),
  am           numeric(18,2) not null check (am = round(qt * pr_px, 2)),
  qt_io        numeric(18,6) not null default 0 check (qt_io >= 0),
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc, no_line),
  foreign key (cd_company, no_doc) references public.pur_poh (cd_company, no_doc) on update cascade on delete cascade,
  foreign key (cd_company, cd_item) references public.mas_item (cd_company, cd_item),
  foreign key (cd_company, cd_wh) references public.mas_wh (cd_company, cd_wh),
  foreign key (cd_uom) references public.mas_uom (cd_uom)
);

create table public.sal_soh (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  st_status    smallint      not null default 10 check (st_status in (10,20,90,99)),
  cd_bp        varchar(20)   not null,
  dt_doc       date          not null default current_date,
  dt_expect    date,
  cd_cur       varchar(3)    not null,
  rt_ex        numeric(18,8) not null check (rt_ex > 0),
  dc_ref       varchar(60),
  dc_note      varchar(500),
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc),
  foreign key (cd_company, cd_bp) references public.mas_bp (cd_company, cd_bp),
  foreign key (cd_company) references public.mas_company (cd_company) on update cascade,
  foreign key (cd_cur) references public.mas_cur (cd_cur),
  constraint chk_sal_soh_date check (dt_expect is null or dt_expect >= dt_doc)
);

create table public.sal_sol (
  cd_company   varchar(10)   not null,
  no_doc       varchar(24)   not null,
  no_line      integer       not null,
  cd_item      varchar(30)   not null,
  nm_item      varchar(200)  not null,
  cd_wh        varchar(20)   not null,
  cd_uom       varchar(10)   not null,
  qt           numeric(18,6) not null check (qt > 0 and qt <= 999999999),
  pr_px        numeric(18,6) not null check (pr_px >= 0 and pr_px <= 999999999999),
  am           numeric(18,2) not null check (am = round(qt * pr_px, 2)),
  qt_io        numeric(18,6) not null default 0 check (qt_io >= 0),
  ext          jsonb,
  tm_reg       timestamptz   not null default now(),
  tm_amd       timestamptz,
  cd_user_reg  uuid          default auth.uid(),
  cd_user_amd  uuid,
  row_version  integer       not null default 1,
  primary key (cd_company, no_doc, no_line),
  foreign key (cd_company, no_doc) references public.sal_soh (cd_company, no_doc) on update cascade on delete cascade,
  foreign key (cd_company, cd_item) references public.mas_item (cd_company, cd_item),
  foreign key (cd_company, cd_wh) references public.mas_wh (cd_company, cd_wh),
  foreign key (cd_uom) references public.mas_uom (cd_uom)
);

-- numbering triggers (auto-assign PUR/SAL + date + seq when no_doc is null)
create trigger tg_pur_poh_number before insert on public.pur_poh
  for each row execute function app.assign_doc_no();
create trigger tg_sal_soh_number before insert on public.sal_soh
  for each row execute function app.assign_doc_no();

-- status/immutability guards + audit touch
create trigger tg_pur_poh_guard before insert or update or delete on public.pur_poh
  for each row execute function app.doc_guard();
create trigger tg_pur_pol_guard before insert or update or delete on public.pur_pol
  for each row execute function app.doc_guard();
create trigger tg_sal_soh_guard before insert or update or delete on public.sal_soh
  for each row execute function app.doc_guard();
create trigger tg_sal_sol_guard before insert or update or delete on public.sal_sol
  for each row execute function app.doc_guard();

create trigger tg_pur_poh_touch before update on public.pur_poh
  for each row execute function app.touch_audit();
create trigger tg_pur_pol_touch before update on public.pur_pol
  for each row execute function app.touch_audit();
create trigger tg_sal_soh_touch before update on public.sal_soh
  for each row execute function app.touch_audit();
create trigger tg_sal_sol_touch before update on public.sal_sol
  for each row execute function app.touch_audit();

-- totals never stored (always correct); security_invoker keeps RLS live through the view
create view public.v_pur_am with (security_invoker = on, security_barrier = on) as
select h.cd_company, h.no_doc,
       coalesce(tot.am_tot, 0) as am_tot,
       round(coalesce(tot.am_tot, 0) * h.rt_ex, 2) as am_base
from public.pur_poh h
left join (select cd_company, no_doc, sum(am) as am_tot from public.pur_pol group by 1, 2) tot
  on tot.cd_company = h.cd_company and tot.no_doc = h.no_doc;

create view public.v_sal_am with (security_invoker = on, security_barrier = on) as
select h.cd_company, h.no_doc,
       coalesce(tot.am_tot, 0) as am_tot,
       round(coalesce(tot.am_tot, 0) * h.rt_ex, 2) as am_base
from public.sal_soh h
left join (select cd_company, no_doc, sum(am) as am_tot from public.sal_sol group by 1, 2) tot
  on tot.cd_company = h.cd_company and tot.no_doc = h.no_doc;

revoke all on public.v_pur_am, public.v_sal_am from anon;

-- Indexes (each with a concrete reason): FK coverage, bp-history, open-doc pickers, date lists
create index if not exists ix_pur_pol_item on public.pur_pol (cd_company, cd_item);
create index if not exists ix_pur_pol_wh   on public.pur_pol (cd_company, cd_wh);
create index if not exists ix_sal_sol_item on public.sal_sol (cd_company, cd_item);
create index if not exists ix_sal_sol_wh   on public.sal_sol (cd_company, cd_wh);
create index if not exists ix_pur_poh_bp   on public.pur_poh (cd_company, cd_bp);
create index if not exists ix_sal_soh_bp   on public.sal_soh (cd_company, cd_bp);
create index if not exists ix_pur_poh_open on public.pur_poh (cd_company, st_status) where st_status in (10, 20);
create index if not exists ix_sal_soh_open on public.sal_soh (cd_company, st_status) where st_status in (10, 20);
create index if not exists ix_pur_poh_date on public.pur_poh (cd_company, dt_doc);
create index if not exists ix_sal_soh_date on public.sal_soh (cd_company, dt_doc);

-- RLS: members only within their companies
alter table public.pur_poh enable row level security;
alter table public.pur_pol enable row level security;
alter table public.sal_soh enable row level security;
alter table public.sal_sol enable row level security;

create policy pur_poh_select on public.pur_poh for select to authenticated using (cd_company in (select app.my_companies()));
create policy pur_poh_insert on public.pur_poh for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy pur_poh_update on public.pur_poh for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy pur_poh_delete on public.pur_poh for delete to authenticated using (cd_company in (select app.my_companies()));

create policy pur_pol_select on public.pur_pol for select to authenticated using (cd_company in (select app.my_companies()));
create policy pur_pol_insert on public.pur_pol for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy pur_pol_update on public.pur_pol for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy pur_pol_delete on public.pur_pol for delete to authenticated using (cd_company in (select app.my_companies()));

create policy sal_soh_select on public.sal_soh for select to authenticated using (cd_company in (select app.my_companies()));
create policy sal_soh_insert on public.sal_soh for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy sal_soh_update on public.sal_soh for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy sal_soh_delete on public.sal_soh for delete to authenticated using (cd_company in (select app.my_companies()));

create policy sal_sol_select on public.sal_sol for select to authenticated using (cd_company in (select app.my_companies()));
create policy sal_sol_insert on public.sal_sol for insert to authenticated with check (cd_company in (select app.my_companies()));
create policy sal_sol_update on public.sal_sol for update to authenticated
  using (cd_company in (select app.my_companies())) with check (cd_company in (select app.my_companies()));
create policy sal_sol_delete on public.sal_sol for delete to authenticated using (cd_company in (select app.my_companies()));

revoke all on public.pur_poh, public.pur_pol, public.sal_soh, public.sal_sol from anon;
