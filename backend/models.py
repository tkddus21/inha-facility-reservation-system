# backend/models.py

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, 
    ForeignKey, TIMESTAMP, TIME, Enum, INT
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
# MySQL 전용 타입을 정확히 임포트합니다.
from sqlalchemy.dialects.mysql import TINYINT

from database import Base 

# --- Roles, Colleges, Departments ---

class Role(Base):
    __tablename__ = "Roles"
    role_id = Column(TINYINT, primary_key=True, autoincrement=True) # DDL과 일치
    name = Column(String(20), unique=True, nullable=False)
    
    users = relationship("User", back_populates="role")

class College(Base):
    __tablename__ = "Colleges"
    college_id = Column(INT, primary_key=True, autoincrement=True) # DDL과 일치
    name = Column(String(100), unique=True, nullable=False)
    
    departments = relationship("Department", back_populates="college")

class Department(Base):
    __tablename__ = "Departments"
    dept_id = Column(INT, primary_key=True, autoincrement=True)
    college_id = Column(INT, ForeignKey("Colleges.college_id"), nullable=False)
    name = Column(String(100), unique=True, nullable=False)
    
    college = relationship("College", back_populates="departments")
    users = relationship("User", back_populates="department")

# --- Users ---

class User(Base):
    __tablename__ = "Users"
    user_id = Column(INT, primary_key=True, autoincrement=True)
    email = Column(String(150), unique=True, nullable=False)
    name = Column(String(80), nullable=False)
    dept_id = Column(INT, ForeignKey("Departments.dept_id"))
    phone = Column(String(30))
    role_id = Column(TINYINT, ForeignKey("Roles.role_id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    department = relationship("Department", back_populates="users")
    role = relationship("Role", back_populates="users")
    reservations = relationship("Reservation", back_populates="user")

# --- Facility Categories & Facilities ---

class FacilityCategory1(Base):
    __tablename__ = "FacilityCategory1"
    cat1_id = Column(INT, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    
    category2_list = relationship("FacilityCategory2", back_populates="category1")

class FacilityCategory2(Base):
    __tablename__ = "FacilityCategory2"
    cat2_id = Column(INT, primary_key=True, autoincrement=True)
    cat1_id = Column(INT, ForeignKey("FacilityCategory1.cat1_id"), nullable=False)
    name = Column(String(100), nullable=False)
    
    category1 = relationship("FacilityCategory1", back_populates="category2_list")
    facilities = relationship("Facility", back_populates="category2")

class Facility(Base):
    __tablename__ = "Facilities"
    facility_id = Column(INT, primary_key=True, autoincrement=True)
    cat2_id = Column(INT, ForeignKey("FacilityCategory2.cat2_id"), nullable=False)
    name = Column(String(150), nullable=False)
    capacity = Column(INT)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    category2 = relationship("FacilityCategory2", back_populates="facilities")
    reservations = relationship("Reservation", back_populates="facility")

# --- Club Categories & Clubs ---

class ClubCategory1(Base):
    __tablename__ = "ClubCategory1"
    cat1_id = Column(INT, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    
    category2_list = relationship("ClubCategory2", back_populates="category1")

class ClubCategory2(Base):
    __tablename__ = "ClubCategory2"
    cat2_id = Column(INT, primary_key=True, autoincrement=True)
    cat1_id = Column(INT, ForeignKey("ClubCategory1.cat1_id"), nullable=False)
    name = Column(String(100), nullable=False)
    
    category1 = relationship("ClubCategory1", back_populates="category2_list")
    clubs = relationship("Club", back_populates="category2")

class Club(Base):
    __tablename__ = "Clubs"
    club_id = Column(INT, primary_key=True, autoincrement=True)
    cat2_id = Column(INT, ForeignKey("ClubCategory2.cat2_id"), nullable=False)
    name = Column(String(150), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    category2 = relationship("ClubCategory2", back_populates="clubs")


# --- Reservations (가장 중요) ---

class Reservation(Base):
    __tablename__ = "Reservations"
    reservation_id = Column(INT, primary_key=True, autoincrement=True)
    user_id = Column(INT, ForeignKey("Users.user_id"), nullable=False)
    facility_id = Column(INT, ForeignKey("Facilities.facility_id"), nullable=False)
    
    # --- [수정됨] 3. 사용단체 분류 컬럼 추가 ---
    org_cat1 = Column(String(100), nullable=True)
    org_cat2 = Column(String(100), nullable=True)
    
    group_name = Column(String(100)) # (이건 '세부 단체명'으로 사용)
    event_name = Column(String(255))

    # --- [수정됨] 2. 행사인원 컬럼 추가 ---
    event_headcount = Column(INT, nullable=True, default=0)

    message = Column(Text)
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    hvac_mode = Column(Enum('none', 'heat', 'cool'), default='none')

    # --- [수정됨] 1. 확인부서 컬럼 추가 ---
    hvac_dept = Column(String(100), nullable=True)

    approval_1 = Column(Enum('pending', 'approved', 'rejected'), default='pending')
    
    # --- [수정됨] 1. 확인부서 컬럼 추가 ---
    approval_1_dept = Column(String(100), nullable=True)
    
    approval_2 = Column(Enum('pending', 'approved', 'rejected'), default='pending')
    
    # --- [수정됨] 1. 확인부서 컬럼 추가 ---
    approval_2_dept = Column(String(100), nullable=True)

    status = Column(Enum('pending', 'confirmed', 'cancelled'), default='pending')
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="reservations")
    facility = relationship("Facility", back_populates="reservations")