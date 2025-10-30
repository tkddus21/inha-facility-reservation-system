# backend/schemas.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# --- User Schemas ---
# (프론트엔드에서 예약자 '이름' 등을 표시하기 위해 필요)

class UserBase(BaseModel):
    user_id: int
    email: str
    name: str
    phone: Optional[str] = None

    class Config:
        orm_mode = True

# --- Facility Schemas ---
# (프론트엔드에서 '시설 이름' 등을 표시하기 위해 필요)

class FacilityBase(BaseModel):
    facility_id: int
    name: str
    capacity: Optional[int] = None

    class Config:
        orm_mode = True
        
# --- Reservation Schemas (가장 중요) ---

# API로 예약을 '생성'할 때 프론트엔드가 보내야 하는 데이터 (POST)
class ReservationCreate(BaseModel):
    user_id: int
    facility_id: int
    group_name: Optional[str] = None
    event_name: Optional[str] = None
    message: Optional[str] = None
    start_time: datetime
    end_time: datetime
    hvac_mode: Optional[str] = 'none'

# API로 예약을 '수정'할 때 프론트엔드가 보내는 데이터 (PUT)
# DDL.sql과 page.tsx에 맞게 수정
class ReservationUpdate(BaseModel):
    approval_1: Optional[str] = None # 'pending', 'approved', 'rejected'
    approval_2: Optional[str] = None # 'pending', 'approved', 'rejected'
    status: Optional[str] = None     # 'pending', 'confirmed', 'cancelled'
    hvac_mode: Optional[str] = None  # 'none', 'heat', 'cool'
    
    # (참고) page.tsx의 status1, status2는 
    # DDL의 approval_1, approval_2와 매핑됩니다.

# API가 예약을 '조회'해서 프론트엔드에게 응답하는 데이터 (GET)
# (중요) user_id, facility_id 대신 실제 User, Facility 정보를 포함
class Reservation(BaseModel):
    reservation_id: int
    user_id: int
    facility_id: int
    
    group_name: Optional[str] = None
    event_name: Optional[str] = None
    message: Optional[str] = None
    
    start_time: datetime
    end_time: datetime
    
    hvac_mode: str
    approval_1: str
    approval_2: str
    status: str
    
    created_at: datetime
    updated_at: datetime
    
    # 관계형 데이터 (Join해서 가져올 정보)
    user: UserBase       # 예약자 정보
    facility: FacilityBase # 시설 정보

    class Config:
        orm_mode = True # SQLAlchemy 모델을 Pydantic 모델로 자동 변환
# ... (schemas.py 파일 맨 아래에 추가) ...
from typing import List

# --- Batch (일괄) 작업용 스키마 ---

class BatchPayload(BaseModel):
    reservation_ids: List[int]