-- Combined mirror of migrations 0091 -> 0094 (guard iterations). Final state = 0094.
-- History for transparency; apply 0094 only if rebuilding from scratch.
--
-- Lifecycle enforced by app.doc_guard() on pur_poh/sal_soh/pur_pol/sal_sol:
--   header:  10 draft -> 20 confirmed -> 99 cancelled;  90 closed ONLY by engine (auth.uid() null)
--   lines:   editable only while header is 10;  qt_io never writable by clients
-- CRITICAL plpgsql lesson fixed in 0094: a BEFORE ROW trigger returning null silently
-- CANCELS the row operation. Success paths must return NEW (insert/update) or OLD (delete);
-- null is reserved for actual rejection.

create or replace function app.doc_guard()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_status smallint;
  v_comp   text := coalesce(new.cd_company, old.cd_company);
  v_doc    text := coalesce(new.no_doc, old.no_doc);
begin
  if tg_table_name in ('pur_pol','sal_sol') then
    if auth.uid() is not null and new.qt_io <> 0 then
      raise exception 'clients may not write qt_io - receive/ship through inventory movements';
    end if;
    if tg_op = 'UPDATE' and new.qt_io is distinct from old.qt_io and auth.uid() is not null then
      raise exception 'clients may not write qt_io - receive/ship through inventory movements';
    end if;

    if tg_table_name = 'pur_pol' then
      select st_status into v_status from public.pur_poh where cd_company = v_comp and no_doc = v_doc;
    else
      select st_status into v_status from public.sal_soh where cd_company = v_comp and no_doc = v_doc;
    end if;

    if v_status is null then
      raise exception 'document % has no header', v_doc;
    end if;
    if v_status <> 10 then
      raise exception 'lines are immutable once the document leaves draft (status %)', v_status;
    end if;
    return new;

  elsif tg_op = 'INSERT' then
    return new;

  elsif tg_op = 'DELETE' then
    if old.st_status <> 10 then
      raise exception 'only draft documents can be deleted (status %)', old.st_status;
    end if;
    return old;

  else
    if new.cd_company is distinct from old.cd_company or new.no_doc is distinct from old.no_doc then
      raise exception 'cd_company and no_doc are immutable';
    end if;

    if new.st_status is distinct from old.st_status then
      if old.st_status = 10 and new.st_status = 20 then return new; end if;
      if old.st_status = 10 and new.st_status = 99 then return new; end if;
      if old.st_status = 20 and new.st_status = 99 then return new; end if;
      if old.st_status = 20 and new.st_status = 90 and auth.uid() is null then return new; end if;
      if old.st_status = 90 and new.st_status = 90 and auth.uid() is null then return new; end if;
      raise exception
        'status transition % -> % not allowed (10 draft -> 20 confirmed; any -> 99 cancelled; 90 closed is set only by inventory posting)',
        old.st_status, new.st_status;
    end if;

    if old.st_status <> 10 then
      raise exception 'only draft documents can be edited (status %)', old.st_status;
    end if;
    return new;
  end if;
end
$$;
