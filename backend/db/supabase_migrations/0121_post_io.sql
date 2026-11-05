-- =====================================================================
-- Posting engine (part 2): post a draft movement.
--
-- FIX RECORDED FROM 0120: source-document progress follows the io_type, NOT the
-- stock direction. A shipment (outbound) INCREASES sal_sol.qt_io exactly like a
-- receipt increases pur_pol.qt_io. The first version used "outbound => negative",
-- which left confirmed SOs permanently open.
--
--   PO: RCPT +qt, PR_RET -qt        SO: SHIP +qt, SR_RET -qt
--
-- Rules enforced:
--   * membership via app.assert_member (SECURITY DEFINER bypasses RLS)
--   * movement must be draft
--   * outbound cannot drive stock negative
--   * over-receipt/over-shipment of a source line is rejected
--   * moving average cost on inbound: (old_qty*old_avg + qt*price) / (old_qty+qt)
--   * source document closes at 90 when every line is fulfilled, reopens to 20
--     when a reversal drops progress below the ordered quantity
--   * engine writes are marked with the transaction-local app.engine flag
-- =====================================================================
create or replace function app.post_io(p_cd_company text, p_no_doc text)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status   smallint;
  v_io_type  text;
  v_src_type text;
  v_src_doc  text;
  v_fg_slip  smallint;
  v_sign     integer;
  v_line     record;
  v_onhand   numeric;
  v_avg      numeric;
  v_new_qt   numeric;
  v_ord_qt   numeric;
  v_ord_io   numeric;
  v_lines    integer := 0;
  v_qt       numeric := 0;
  v_done     boolean;
begin
  perform app.assert_member(p_cd_company);

  select st_status, cd_io_type, cd_src_type, cd_src_doc
    into v_status, v_io_type, v_src_type, v_src_doc
    from public.mtl_ioh
   where cd_company = p_cd_company and no_doc = p_no_doc
   for update;
  if not found then raise exception 'movement % not found', p_no_doc; end if;
  if v_status <> 10 then raise exception 'movement % is not a draft (status %)', p_no_doc, v_status; end if;

  select fg_slip into v_fg_slip from public.mas_io_type where cd_io_type = v_io_type;
  if v_fg_slip is null then raise exception 'unknown io type %', v_io_type; end if;
  if v_fg_slip not in (1,2) then raise exception 'io type % has no direction (fg_slip=%)', v_io_type, v_fg_slip; end if;

  v_sign := case
    when v_src_type = 'PO' and v_io_type = 'RCPT'   then 1
    when v_src_type = 'PO' and v_io_type = 'PR_RET' then -1
    when v_src_type = 'SO' and v_io_type = 'SHIP'   then 1
    when v_src_type = 'SO' and v_io_type = 'SR_RET' then -1
    else 0 end;

  perform set_config('app.engine', 'on', true);

  -- deterministic item/warehouse order reduces deadlock risk between concurrent postings
  for v_line in
    select * from public.mtl_iol
     where cd_company = p_cd_company and no_doc = p_no_doc
     order by cd_item, cd_wh, no_line
  loop
    v_lines := v_lines + 1;
    v_qt := v_qt + v_line.qt;

    insert into public.mtl_stock (cd_company, cd_item, cd_wh, qt_onhand, pr_avg)
         values (p_cd_company, v_line.cd_item, v_line.cd_wh, 0, 0)
    on conflict (cd_company, cd_item, cd_wh) do nothing;

    select qt_onhand, pr_avg into v_onhand, v_avg
      from public.mtl_stock
     where cd_company = p_cd_company and cd_item = v_line.cd_item and cd_wh = v_line.cd_wh
     for update;

    if v_fg_slip = 1 then
      v_new_qt := v_onhand + v_line.qt;
      update public.mtl_stock
         set qt_onhand = v_new_qt,
             pr_avg = case when v_new_qt > 0
                           then round(((v_onhand * v_avg) + (v_line.qt * v_line.pr_px)) / v_new_qt, 6)
                           else v_avg end,
             tm_amd = now()
       where cd_company = p_cd_company and cd_item = v_line.cd_item and cd_wh = v_line.cd_wh;
    else
      if v_onhand < v_line.qt then
        raise exception 'insufficient stock: item % at warehouse % has %, movement needs %',
          v_line.cd_item, v_line.cd_wh, v_onhand, v_line.qt;
      end if;
      update public.mtl_stock
         set qt_onhand = v_onhand - v_line.qt, tm_amd = now()
       where cd_company = p_cd_company and cd_item = v_line.cd_item and cd_wh = v_line.cd_wh;
    end if;

    if v_sign <> 0 and v_line.cd_src_line is not null then
      if v_src_type = 'PO' then
        select qt, qt_io into v_ord_qt, v_ord_io
          from public.pur_pol
         where cd_company = p_cd_company and no_doc = v_src_doc and no_line = v_line.cd_src_line
         for update;
      else
        select qt, qt_io into v_ord_qt, v_ord_io
          from public.sal_sol
         where cd_company = p_cd_company and no_doc = v_src_doc and no_line = v_line.cd_src_line
         for update;
      end if;

      if v_ord_qt is null then
        raise exception 'source line % of % % not found', v_line.cd_src_line, v_src_type, v_src_doc;
      end if;

      if v_sign = 1 then
        if v_ord_io + v_line.qt > v_ord_qt then
          raise exception 'over-receipt/shipment: % % line % ordered %, already % - movement adds %',
            v_src_type, v_src_doc, v_line.cd_src_line, v_ord_qt, v_ord_io, v_line.qt;
        end if;
        v_ord_io := v_ord_io + v_line.qt;
      else
        v_ord_io := greatest(0, v_ord_io - v_line.qt);
      end if;

      if v_src_type = 'PO' then
        update public.pur_pol set qt_io = v_ord_io
         where cd_company = p_cd_company and no_doc = v_src_doc and no_line = v_line.cd_src_line;
      else
        update public.sal_sol set qt_io = v_ord_io
         where cd_company = p_cd_company and no_doc = v_src_doc and no_line = v_line.cd_src_line;
      end if;
    end if;
  end loop;

  if v_lines = 0 then raise exception 'movement % has no lines', p_no_doc; end if;

  if v_sign <> 0 and v_src_doc is not null then
    if v_src_type = 'PO' then
      select bool_and(qt_io >= qt) into v_done
        from public.pur_pol where cd_company = p_cd_company and no_doc = v_src_doc;
      update public.pur_poh
         set st_status = case when v_done then 90 else 20 end
       where cd_company = p_cd_company and no_doc = v_src_doc
         and st_status in (20, 90)
         and st_status <> case when v_done then 90 else 20 end;
    else
      select bool_and(qt_io >= qt) into v_done
        from public.sal_sol where cd_company = p_cd_company and no_doc = v_src_doc;
      update public.sal_soh
         set st_status = case when v_done then 90 else 20 end
       where cd_company = p_cd_company and no_doc = v_src_doc
         and st_status in (20, 90)
         and st_status <> case when v_done then 90 else 20 end;
    end if;
  end if;

  update public.mtl_ioh set st_status = 20
   where cd_company = p_cd_company and no_doc = p_no_doc;

  perform set_config('app.engine', 'off', true);

  return jsonb_build_object('no_doc', p_no_doc, 'status', 20, 'lines', v_lines, 'qt', v_qt);
end
$$;

revoke all on function app.post_io(text, text) from public, anon;
grant execute on function app.post_io(text, text) to authenticated;
