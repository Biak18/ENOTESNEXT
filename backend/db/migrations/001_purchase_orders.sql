-- Purchase order persistence (document + detail rows).
-- Company scope is enforced from the authenticated cd_com claim in the API.
-- This migration only creates the tables; it does not seed mock purchase data.

begin;

create table if not exists public.pur_purchase_order (
    cd_company   varchar(50)  not null,
    cd_order     varchar(50)  not null,
    nm_supplier  varchar(200) not null,
    dt_order     date         not null,
    dt_expected  date         null,
    cd_currency  varchar(3)   not null,
    dc_reference varchar(200) null,
    dc_notes     text         null,
    tm_reg       timestamptz  not null default current_timestamp,
    tm_amd       timestamptz  null,
    constraint pk_pur_purchase_order primary key (cd_company, cd_order)
);

create index if not exists ix_pur_purchase_order_company_date
    on public.pur_purchase_order (cd_company, dt_order desc);

create table if not exists public.pur_purchase_order_line (
    cd_company    varchar(50)   not null,
    cd_order      varchar(50)   not null,
    no_line       integer       not null,
    cd_item       varchar(50)   not null,
    nm_item       varchar(200)  not null,
    cd_category   varchar(100)  not null,
    cd_location   varchar(100)  not null,
    nm_unit       varchar(50)   not null,
    qt_order      numeric(18,4) not null,
    am_unit_price numeric(18,4) not null,
    am_line       numeric(18,2) not null,
    constraint pk_pur_purchase_order_line primary key (cd_company, cd_order, no_line),
    constraint fk_pur_purchase_order_line_order
        foreign key (cd_company, cd_order)
        references public.pur_purchase_order (cd_company, cd_order)
        on delete cascade,
    constraint ck_pur_purchase_order_line_no_line check (no_line > 0),
    constraint ck_pur_purchase_order_line_quantity check (qt_order > 0),
    constraint ck_pur_purchase_order_line_unit_price check (am_unit_price >= 0)
);

commit;
