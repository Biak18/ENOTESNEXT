-- ===== Reusable slip numbering: one function, one trigger, any module =====
-- Format: <MODULE><yyyymmdd><zero-padded seq>  e.g. PUR20261103001
-- No per-table code: app.assign_doc_no() derives the prefix from the table name
-- (pur_poh -> PUR, sal_soh -> SAL, mtl_ioh -> MTL, <future_x> -> <prefix>).

create table public.sys_seq (
  cd_company varchar(10) not null,
  cd_prefix  varchar(10) not null,
  no_period  varchar(8)  not null,          -- yyyymmdd
  no_last    bigint    not null default 0,
  tm_reg     timestamptz not null default now(),
  tm_amd     timestamptz,
  primary key (cd_company, cd_prefix, no_period)
);

alter table public.sys_seq enable row level security;
revoke all on public.sys_seq from anon, authenticated;

create or replace function app.next_doc_no(p_cd_company text, p_prefix text)
returns varchar
language plpgsql security definer
set search_path = ''
as $$
declare
  v_ymd text;
  v_no  bigint;
begin
  if p_cd_company is null or p_prefix is null then
    raise exception 'next_doc_no requires cd_company and prefix';
  end if;
  v_ymd := to_char(now(), 'YYYYMMDD');
  insert into public.sys_seq (cd_company, cd_prefix, no_period, no_last)
       values (p_cd_company, upper(p_prefix), v_ymd, 1)
       on conflict (cd_company, cd_prefix, no_period)
       do update set no_last = public.sys_seq.no_last + 1, tm_amd = now()
       returning no_last into v_no;
  return upper(p_prefix) || v_ymd || lpad(v_no::text, 3, '0');
end
$$;
revoke all on function app.next_doc_no(text, text) from public, anon;
grant execute on function app.next_doc_no(text, text) to authenticated;

create or replace function app.assign_doc_no()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  if new.no_doc is null or new.no_doc = '' then
    new.no_doc := app.next_doc_no(new.cd_company, upper(split_part(tg_table_name, '_', 1)));
  end if;
  return new;
end
$$;
revoke all on function app.assign_doc_no() from public, anon;
