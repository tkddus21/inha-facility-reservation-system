USE inha_reserv;

-- 1. 확인부서 컬럼 3개 추가 (dept1, dept2, hvacCheckDept 용)
ALTER TABLE Reservations
    ADD COLUMN approval_1_dept VARCHAR(100) NULL DEFAULT NULL COMMENT '1차 확인부서명' AFTER approval_1,
    ADD COLUMN approval_2_dept VARCHAR(100) NULL DEFAULT NULL COMMENT '2차 확인부서명' AFTER approval_2,
    ADD COLUMN hvac_dept VARCHAR(100) NULL DEFAULT NULL COMMENT '냉난방 확인부서명' AFTER hvac_mode;

-- 2. 행사인원 컬럼 1개 추가 (eventHeadcount 용)
ALTER TABLE Reservations
    ADD COLUMN event_headcount INT NULL DEFAULT 0 COMMENT '행사인원' AFTER event_name;

-- 3. 사용단체 분류 컬럼 2개 추가 (orgName, orgMiddleCat 용)
-- (기존 group_name 컬럼은 orgDetail 또는 finalOrgName 용도로 사용)
ALTER TABLE Reservations
    ADD COLUMN org_cat1 VARCHAR(100) NULL DEFAULT NULL COMMENT '사용단체 대분류' AFTER facility_id,
    ADD COLUMN org_cat2 VARCHAR(100) NULL DEFAULT NULL COMMENT '사용단체 중분류' AFTER org_cat1;