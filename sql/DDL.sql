
-- 기존 DB 제거 후 새로 생성
DROP DATABASE IF EXISTS inha_reserv;
CREATE DATABASE inha_reserv
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;


USE inha_reserv;
-- Roles
CREATE TABLE Roles (
    role_id TINYINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) UNIQUE NOT NULL COMMENT '역할명 (student, professor, staff, admin)'
);

-- Departments 
CREATE TABLE Colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '단과대 이름'
);

-- 학과 테이블 (단과대와 연결)
CREATE TABLE Departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    college_id INT NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '학과 이름',
    FOREIGN KEY (college_id) REFERENCES Colleges(college_id)
);

-- Users 
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(80) NOT NULL,
    dept_id INT,
    phone VARCHAR(30),
    role_id TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_dept FOREIGN KEY (dept_id) REFERENCES Departments(dept_id),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Facilities 
CREATE TABLE FacilityCategory1 (
    cat1_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT '대분류 (예: 스터디룸, 체육시설, 가무연습실, 강의실)'
);

CREATE TABLE FacilityCategory2 (
    cat2_id INT PRIMARY KEY AUTO_INCREMENT,
    cat1_id INT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT '중분류 (예: 해동스터디룸, 운동장 등)',
    CONSTRAINT fk_cat2_cat1 FOREIGN KEY (cat1_id)
        REFERENCES FacilityCategory1(cat1_id)
        ON DELETE CASCADE
);

CREATE TABLE Facilities (
    facility_id INT PRIMARY KEY AUTO_INCREMENT,
    cat2_id INT NOT NULL,
    name VARCHAR(150) NOT NULL COMMENT '시설명 (예: 해동스터디룸A(하-132A))',
    capacity INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fac_cat2 FOREIGN KEY (cat2_id)
        REFERENCES FacilityCategory2(cat2_id)
        ON DELETE CASCADE
);

-- club 
CREATE TABLE ClubCategory1 (
    cat1_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL COMMENT '대분류 (예: 중앙동아리, 학생회(단과대/전공), 학생자치기구 등)'
);

CREATE TABLE ClubCategory2 (
    cat2_id INT PRIMARY KEY AUTO_INCREMENT,
    cat1_id INT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT '중분류 (예: 공연, 어학, 공과대학 등)',
    CONSTRAINT fk_club_cat2_cat1 FOREIGN KEY (cat1_id)
        REFERENCES ClubCategory1(cat1_id)
        ON DELETE CASCADE
);

CREATE TABLE Clubs (
    club_id INT PRIMARY KEY AUTO_INCREMENT,
    cat2_id INT NOT NULL,
    name VARCHAR(150) NOT NULL COMMENT '동아리명 (예: 인하오케스트라, 기계공학과 학생회 등)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_club_cat2 FOREIGN KEY (cat2_id)
        REFERENCES ClubCategory2(cat2_id)
        ON DELETE CASCADE
);

-- Reservations 
CREATE TABLE Reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    group_name VARCHAR(100),
    event_name VARCHAR(255),
    message TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    hvac_mode ENUM('none','heat','cool') DEFAULT 'none' COMMENT '냉난방 모드',
    approval_1 ENUM('pending','approved','rejected') DEFAULT 'pending',
    approval_2 ENUM('pending','approved','rejected') DEFAULT 'pending',
    status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resv_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_resv_fac FOREIGN KEY (facility_id) REFERENCES Facilities(facility_id) ON DELETE CASCADE
);

