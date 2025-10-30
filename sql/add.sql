USE inha_reserv;

-- 1. 예약 시간대 제한 (08:00~21:59)
ALTER TABLE Reservations
ADD CONSTRAINT chk_time_range CHECK (
    TIME(start_time) BETWEEN '08:00:00' AND '21:50:00'
    AND TIME(end_time) BETWEEN '08:09:00' AND '21:59:00'
);

-- 2. 중복 탐색 및 조회 속도 향상용 인덱스
CREATE INDEX idx_reservation_time ON Reservations(facility_id, start_time, end_time);
CREATE INDEX idx_user_id ON Reservations(user_id);
CREATE INDEX idx_facility_id ON Reservations(facility_id);
CREATE INDEX idx_status ON Reservations(status);

-- 3. 관리자 계정 미리 등록
INSERT INTO Users (email, name, dept_id, phone, role_id)
VALUES ('admin@inha.ac.kr', '관리자', NULL, '010-0000-0000', 4);

-- 4. 한국 시간대 설정 (1회성)
SET time_zone = '+09:00';
