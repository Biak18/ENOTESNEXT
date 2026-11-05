-- =====================================================================
-- Posting engine (part 1): authorization, PO/SO draft builders, reversal.
-- All SECURITY DEFINER + explicit company membership check.
-- post_io itself lives in 0121 (final version after the progress-direction fix).
-- =====================================================================

create or replace function app.assert_member(p_cd_company text)
returns void
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if not exists (
    select 1 from public.sys_user_company suc
     where suc.user_id = auth.uid() and suc.cd_company = p_cd_company
  ) then
    raise exception 'not a member of company %', p_cd_company;
  end if;
end
$$;

create or replace function app.create_io_from_po(p_cd_company text, p_no_doc text)
returns varchar
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status smallint;
  v_new    varchar(24);
  v_n      integer;
begin
  perform app.assert_member(p_cd_company);

  select st_status into v_status
    from public.pur_poh
   where cd_company = p_cd_company and no_doc = p_no_doc
   for update;
  if not found then raise exception 'purchase order % not found', p_no_doc; end if;
  if v_status <> 20 then raise exception 'purchase order % is not confirmed (status %)', p_no_doc, v_status; end if;

  insert into public.mtl_ioh (cd_company, no_doc, cd_io_type, dt_io, cd_src_type, cd_src_doc, dc_ref)
       values (p_cd_company, null, 'RCPT', current_date, 'PO', p_no_doc, 'Receipt for ' || p_no_doc)
    returning no_doc into v_new;

  insert into public.mtl_iol (cd_company, no_doc, no_line, cd_item, nm_item, cd_wh, cd_uom, qt, pr_px, am, cd_src_line)
  select p_cd_company, v_new,
         row_number() over (order by no_line)::int,
         l.cd_item, l.nm_item, l.cd_wh, l.cd_uom,
         round(l.qt - l.qt_io, 6),
         l.pr_px,
         round(round(l.qt - l.qt_io, 6) * l.pr_px, 2),
         l.no_line
    from public.pur_pol l
   where l.cd_company = p_cd_company and l.no_doc = p_no_doc and l.qt_io < l.qt;

  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'purchase order % has no outstanding lines', p_no_doc; end if;
  return v_new;
end
$$;

create or replace function app.create_io_from_so(p_cd_company text, p_no_doc text)
returns varchar
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status smallint;
  v_new    varchar(24);
  v_n      integer;
begin
  perform app.assert_member(p_cd_company);

  select st_status into v_status
    from public.sal_soh
   where cd_company = p_cd_company and no_doc = p_no_doc
   for update;
  if not found then raise exception 'sales order % not found', p_no_doc; end if;
  if v_status <> 20 then raise exception 'sales order % is not confirmed (status %)', p_no_doc, v_status; end if;

  insert into public.mtl_ioh (cd_company, no_doc, cd_io_type, dt_io, cd_src_type, cd_src_doc, dc_ref)
       values (p_cd_company, null, 'SHIP', current_date, 'SO', p_no_doc, 'Shipment for ' || p_no_doc)
    returning no_doc into v_new;

  insert into public.mtl_iol (cd_company, no_doc, no_line, cd_item, nm_item, cd_wh, cd_uom, qt, pr_px, am, cd_src_line)
  select p_cd_company, v_new,
         row_number() over (order by no_line)::int,
         l.cd_item, l.nm_item, l.cd_wh, l.cd_uom,
         round(l.qt - l.qt_io, 6),
         l.pr_px,
         round(round(l.qt - l.qt_io, 6) * l.pr_px, 2),
         l.no_line
    from public.sal_sol l
   where l.cd_company = p_cd_company and l.no_doc = p_no_doc and l.qt_io < l.qt;

  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'sales order % has no outstanding lines', p_no_doc; end if;
  return v_new;
end
$$;

create or replace function app.reverse_io(p_cd_company text, p_no_doc text, p_dc_reason text default null)
returns varchar
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status  smallint;
  v_io_type text;
  v_src_type text;
  v_src_doc text;
  v_rev     text;
  v_new     varchar(24);
begin
  perform app.assert_member(p_cd_company);

  select st_status, cd_io_type, cd_src_type, cd_src_doc
    into v_status, v_io_type, v_src_type, v_src_doc
    from public.mtl_ioh
   where cd_company = p_cd_company and no_doc = p_no_doc
   for update;
  if not found then raise exception 'movement % not found', p_no_doc; end if;
  if v_status <> 20 then raise exception 'only posted movements can be reversed (status %)', v_status; end if;

  v_rev := case v_io_type
    when 'RCPT'   then 'PR_RET'
    when 'PR_RET' then 'RCPT'
    when 'SHIP'   then 'SR_RET'
    when 'SR_RET' then 'SHIP'
    when 'TRF_IN' then 'TRF_OUT'
    when 'TRF_OUT' then 'TRF_IN'
    when 'ADJ_IN' then 'ADJ_OUT'
    when 'ADJ_OUT' then 'ADJ_IN'
    else null end;
  if v_rev is null then raise exception 'no reversal type for io type %', v_io_type; end if;

  insert into public.mtl_ioh (cd_company, no_doc, cd_io_type, dt_io, cd_src_type, cd_src_doc, dc_ref, dc_note)
       values (p_cd_company, null, v_rev, current_date, v_src_type, v_src_doc,
               'Reversal of ' || p_no_doc, left(p_dc_reason, 500))
    returning no_doc into v_new;

  insert into public.mtl_iol (cd_company, no_doc, no_line, cd_item, nm_item, cd_wh, cd_uom, qt, pr_px, am, cd_src_line)
  select p_cd_company, v_new,
         row_number() over (order by no_line)::int,
         cd_item, nm_item, cd_wh, cd_uom, qt, pr_px, am, cd_src_line
    from public.mtl_iol
   where cd_company = p_cd_company and no_doc = p_no_doc;

  return v_new;
end
$$;

revoke all on function app.assert_member(text) from public, anon, authenticated;
revoke all on function app.create_io_from_po(text, text) from public, anon;
revoke all on function app.create_io_from_so(text, text) from public, anon;
revoke all on function app.reverse_io(text, text, text) from public, anon;

grant execute on function app.create_io_from_po(text, text) to authenticated;
grant execute on function app.create_io_from_so(text, text) to authenticated;
grant execute on function app.reverse_io(text, text, text) to authenticated;
