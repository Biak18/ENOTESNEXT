-- auth.uid() is NOT null inside SECURITY DEFINER RPCs called via PostgREST
-- (the JWT claims GUC persists into the function). Engine writes are therefore marked
-- explicitly with a transaction-local app.engine flag set only by posting functions.
-- Also adds the engine-only reopen transition 90 -> 20 (reversal drops progress below order).
create or replace function app.doc_guard()
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
  if tg_table_name in ('pur_pol','sal_sol') then
    if not v_engine and new.qt_io <> 0 then
      raise exception 'clients may not write qt_io - receive/ship through inventory movements';
    end if;
    if tg_op = 'UPDATE' and new.qt_io is distinct from old.qt_io and not v_engine then
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
    if v_status <> 10 and not v_engine then
      raise exception 'lines are immutable once the document leaves draft (status %)', v_status;
    end if;
    return case when tg_op = 'DELETE' then old else new end;

  elsif tg_op = 'INSERT' then
    return new;

  elsif tg_op = 'DELETE' then
    if old.st_status <> 10 and not v_engine then
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
      if v_engine and old.st_status = 20 and new.st_status = 90 then return new; end if;
      if v_engine and old.st_status = 90 and new.st_status = 20 then return new; end if;
      if v_engine and old.st_status = 90 and new.st_status = 90 then return new; end if;
      raise exception
        'status transition % -> % not allowed (10 draft -> 20 confirmed; any -> 99 cancelled; 90 close/reopen is engine-only)',
        old.st_status, new.st_status;
    end if;

    if old.st_status <> 10 and not v_engine then
      raise exception 'only draft documents can be edited (status %)', old.st_status;
    end if;
    return new;
  end if;
end
$$;
