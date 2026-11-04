-- Fix: left-bar menu order shuffled on every login.
-- Root cause: sys_menu.no_pos was effectively invalid (11 rows = 'F', one '', one '999999')
-- so ORDER BY no_pos had unresolved ties => non-deterministic order per execution.
-- Fix: real per-parent zero-padded positions + tie-breaker (no_pos, cd_menu_parent, cd_menu)
-- in both tree functions ap_enotes_001_s and ap_cus_reg_001_s.

-- ===== 1. Position data repair =====
update public.sys_menu set no_pos = '0010' where cd_menu in ('BAS','PUR','SAL','MAS','SYS','EN_PUR_BAS_REG_001','EN_SAL_REG_001','EN_MAS_ORG_REG_001');
update public.sys_menu set no_pos = '0020' where cd_menu = 'EN_SYS_BAS_REG_001';
update public.sys_menu set no_pos = '0030' where cd_menu = 'EN_SYS_AUT_REG_003'; -- superseded by 9030 below
update public.sys_menu set no_pos = '0020' where cd_menu = 'EN_SYS_AUT_REG_002'; -- superseded by 9020 below
update public.sys_menu set no_pos = '0030' where cd_menu = 'SYS' and cd_menu_parent = 'BAS'; -- superseded by 0040 below
update public.sys_menu set no_pos = '0010' where cd_menu = 'PUR';
update public.sys_menu set no_pos = '0020' where cd_menu = 'SAL';
update public.sys_menu set no_pos = '0030' where cd_menu = 'MAS';
update public.sys_menu set no_pos = '0040' where cd_menu = 'SYS';
update public.sys_menu set no_pos = '0050' where cd_menu = 'EN_SYS_MENU_REG_001';
update public.sys_menu set no_pos = '9010' where cd_menu in ('EN_SYS_AUT_REG_001','EN_MAS_ORG_REG_001','EN_PUR_BAS_REG_001','EN_SAL_REG_001');
update public.sys_menu set no_pos = '9020' where cd_menu = 'EN_SYS_AUT_REG_002';
update public.sys_menu set no_pos = '9030' where cd_menu = 'EN_SYS_AUT_REG_003';

-- ===== 2. ap_enotes_001_s: deterministic tie-breaker =====
create or replace function public.ap_enotes_001_s(p_cd_menu character varying, p_nm_menu character varying, p_search character varying, p_cd_company character varying, p_cd_user character varying, p_fg_role character varying)
 RETURNS TABLE(cd_menu character varying, nm_menu character varying, nm_netwindow character varying, fg_type character, cd_module character varying, no_pos character varying, cd_menu_parent character varying)
 LANGUAGE plpgsql
AS $function$DECLARE
    v_cd_company varchar := COALESCE(NULLIF(p_cd_company, ''), 'SYSTEM');
    v_cd_user    varchar := COALESCE(NULLIF(p_cd_user, ''), '');
    v_fg_role    varchar := COALESCE(NULLIF(p_fg_role, ''), '');
BEGIN
    RETURN QUERY
    SELECT *
    FROM (
        SELECT
            sm.cd_menu,
            sm.nm_menu,
            sm.nm_netwindow,
            sm.fg_type,
            sm.cd_module,
            sm.no_pos,
            sm.cd_menu_parent
        FROM sys_menu sm
        LEFT JOIN sys_companymenu cm ON sm.cd_menu = cm.cd_menu
       WHERE
        (
            sm.cd_menu IN ('BAS', 'EN_SYS_MENU_REG_001')
            OR
            (
                (( v_cd_company = 'SYSTEM' or cm.cd_company = v_cd_company))
                AND
                (
                    v_cd_company = 'SYSTEM'
                    OR v_fg_role = 'SYSTEM_ADMIN'
                    OR
                    COALESCE(
                        (SELECT CASE
                                    WHEN um.fg_action = 'A' THEN TRUE
                                    WHEN um.fg_action = 'N' THEN FALSE
                                END
                         FROM sys_usermenu um
                         WHERE um.cd_menu = sm.cd_menu
                           AND um.cd_user = v_cd_user
                           AND um.cd_company = v_cd_company),
                        EXISTS (
                            SELECT 1 FROM sys_rolemenu rm
                            WHERE rm.cd_menu = sm.cd_menu
                              AND rm.fg_role = v_fg_role
                        )
                    ) = TRUE
                )
            )
        )
        AND (sm.cd_menu = p_cd_menu OR p_cd_menu = '' OR p_cd_menu IS NULL)
        AND (
            sm.nm_menu ILIKE '%' || p_nm_menu || '%'
            OR p_nm_menu = ''
            OR p_nm_menu IS NULL
        )
    ) a
    ORDER BY a.no_pos, a.cd_menu_parent, a.cd_menu;
END;$function$;

-- ===== 3. ap_cus_reg_001_s: add the missing ORDER BY =====
create or replace function public.ap_cus_reg_001_s(p_nm_menu character varying)
 RETURNS TABLE(cd_menu character varying, nm_menu character varying, nm_netwindow character varying, fg_type character, cd_module character varying, no_pos character varying, cd_menu_parent character varying)
 LANGUAGE sql
AS $function$
    SELECT
        sm.cd_menu,
        sm.nm_menu,
        sm.nm_netwindow,
        sm.fg_type,
        sm.cd_module,
        sm.no_pos,
        sm.cd_menu_parent
    FROM sys_menu sm
  WHERE
(
    p_nm_menu IS NULL
    OR p_nm_menu = ''
    OR sm.nm_menu ILIKE '%' || p_nm_menu || '%'
    OR EXISTS (
        SELECT 1
        FROM sys_menu c
        WHERE c.cd_menu_parent = sm.cd_menu
          AND c.nm_menu ILIKE '%' || p_nm_menu || '%'
    )
)
  ORDER BY sm.no_pos, sm.cd_menu_parent, sm.cd_menu
;$function$;
