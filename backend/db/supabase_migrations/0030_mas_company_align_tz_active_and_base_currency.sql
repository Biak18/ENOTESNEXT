-- mas_company is empty => type/strictness changes are risk-free.
alter table public.mas_company
  alter column tm_reg    type timestamptz using tm_reg at time zone 'UTC',
  alter column tm_amd    type timestamptz using tm_amd at time zone 'UTC',
  alter column fl_active set not null,
  add column cd_cur_base varchar(3) not null default 'USD' references public.mas_cur (cd_cur);
