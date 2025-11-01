# backend/schemas.py

from pydantic import BaseModel, ConfigDict # 👈 ConfigDict를 import에 추가
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
class UserBase(BaseModel):
    user_id: int
    email: str
    name: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True # 👈 orm_mode 대신 from_attributes

# --- Facility Schemas (지난번에 수정함) ---
class FacilityCategory1Base(BaseModel):
    name: str
    class Config:
        from_attributes = True

class FacilityCategory2Base(BaseModel):
    name: str
    category1: FacilityCategory1Base
    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    facility_id: int
    name: str
    capacity: Optional[int] = None
    category2: FacilityCategory2Base
    class Config:
        from_attributes = True
        
# --- Reservation Schemas (가장 중요) ---

# [수정됨] API로 예약을 '생성'할 때 프론트엔드가 보내는 데이터 (POST)
# (app/page.tsx의 handleSubmit과 일치시킴)
class ReservationCreate(BaseModel):
    user_id: int
    facility_id: int
    
    # --- [추가됨] 3. 사용단체 분류 ---
    org_cat1: Optional[str] = None
    org_cat2: Optional[str] = None
    group_name: Optional[str] = None # (세부 단체명)

    event_name: Optional[str] = None
    
    # --- [추가됨] 2. 행사인원 ---
    event_headcount: Optional[int] = 0

    message: Optional[str] = None
    start_time: datetime
    end_time: datetime
    hvac_mode: Optional[str] = 'none'

    # --- [추가됨] 1. 확인부서 ---
    hvac_dept: Optional[str] = None
    approval_1_dept: Optional[str] = None
    approval_2_dept: Optional[str] = None
    
    # (참고) status, approval_1, approval_2는
    #       백엔드의 models.py에서 default='pending'으로 자동 설정됨.
    #       프론트에서 굳이 'pending'으로 보낼 필요 없음.
    #       (단, app/page.tsx의 handleSubmit에서 보내는
    #       status: '신청중'은 create_reservation에서 처리 필요)


# API로 예약을 '수정'할 때 프론트엔드가 보내는 데이터 (PUT)
class ReservationUpdate(BaseModel):
    approval_1: Optional[str] = None 
    approval_2: Optional[str] = None 
    status: Optional[str] = None     
    hvac_mode: Optional[str] = None  
    
    status1: Optional[str] = None # (page.tsx의 'status1' 필드 대응)
    status2: Optional[str] = None # (page.tsx의 'status2' 필드 대응)


# [수정됨] API가 예약을 '조회'해서 프론트엔드에게 응답하는 데이터 (GET)
class Reservation(BaseModel):
    reservation_id: int
    user_id: int
    facility_id: int
    
    # --- [추가됨] 3. 사용단체 분류 ---
    org_cat1: Optional[str] = None
    org_cat2: Optional[str] = None
    group_name: Optional[str] = None
    
    event_name: Optional[str] = None

    # --- [추가됨] 2. 행사인원 ---
    event_headcount: Optional[int] = 0

    message: Optional[str] = None
    start_time: datetime
    end_time: datetime
    hvac_mode: str
    
    # --- [추가됨] 1. 확인부서 ---
    hvac_dept: Optional[str] = None
    approval_1: str
    approval_1_dept: Optional[str] = None
    approval_2: str
    approval_2_dept: Optional[str] = None
    
    status: str
    created_at: datetime
    updated_at: datetime
    
    # 관계형 데이터 (Join해서 가져올 정보)
    user: UserBase
    facility: FacilityBase

    class Config:
        from_attributes = True # 👈 orm_mode 대신 from_attributes

# --- Batch (일괄) 작업용 스키마 ---
class BatchPayload(BaseModel):
    reservation_ids: List[int]