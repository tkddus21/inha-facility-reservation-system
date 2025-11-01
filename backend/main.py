# backend/main.py

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from fastapi.responses import StreamingResponse
import openpyxl
import io
# 우리가 만든 파일들을 import (이제 . 없이)
import models
import schemas
from database import engine, get_db, Base

# FastAPI 앱 생성
app = FastAPI()

# --- (참고) CORS 설정 ---
# 프론트엔드(localhost:3000)에서 백엔드(localhost:8000)로 요청할 수 있게 허용
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000", # Next.js 개발 서버 주소
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB 테이블 생성 ---
# DDL.sql을 이미 DB에 적용했다면 이 줄은 사실상 불필요하나,
# 로컬 테스트(sqlite)를 위해 유지합니다.
Base.metadata.create_all(bind=engine)


# --- 2단계: 핵심 API (CRUD) ---

@app.get("/api/reservations", response_model=List[schemas.Reservation])
def get_reservations(
    db: Session = Depends(get_db),
    # page.tsx의 필터링을 위한 쿼리 파라미터 (DDL.sql 기준)
    startDate: Optional[datetime] = Query(None),
    endDate: Optional[datetime] = Query(None),
    status: Optional[str] = Query(None) # DDL: pending, confirmed, cancelled
):
    """
    예약 목록 조회 (GET /api/reservations)
    page.tsx의 '조회' 버튼 기능
    (중요) User, Facility 정보를 JOIN하여 함께 반환
    """
    
    # 기본 쿼리: Reservation 테이블과 User, Facility를 JOIN
    query = db.query(models.Reservation).options(
        joinedload(models.Reservation.user),
        joinedload(models.Reservation.facility)
    )

    # 1. 날짜 필터링 (start_time 기준)
    if startDate:
        query = query.filter(models.Reservation.start_time >= startDate)
    if endDate:
        # DDL.sql 기준 end_time으로 변경
        query = query.filter(models.Reservation.end_time <= endDate.replace(hour=23, minute=59, second=59))
        
    # 2. 상태 필터링 (page.tsx의 '전체'는 무시)
    if status and status != "전체":
        # '취소'의 경우 DDL의 'cancelled'와 매핑
        if status == "취소":
            query = query.filter(models.Reservation.status == 'cancelled')
        # '승인'의 경우 DDL의 'confirmed'와 매핑
        elif status == "승인":
            query = query.filter(models.Reservation.status == 'confirmed')
        # '신청중'의 경우 DDL의 'pending'과 매핑
        elif status == "신청중":
             query = query.filter(models.Reservation.status == 'pending')
        # (기타 DDL에 정의된 status 값들...)
        else:
             query = query.filter(models.Reservation.status == status)


    reservations = query.order_by(models.Reservation.created_at.desc()).all()
    return reservations

@app.post("/api/reservations", response_model=schemas.Reservation)
def create_reservation(
    reservation: schemas.ReservationCreate, 
    db: Session = Depends(get_db)
):
    """
    새 예약 생성 (POST /api/reservations)
    """
    
    # 1. 프론트에서 받은 데이터(reservation)로 DB 모델 객체 생성
    db_reservation = models.Reservation(**reservation.model_dump())
    
    # 2. DB 세션에 추가
    db.add(db_reservation)
    
    # 3. DB에 커밋 (실제 저장)
    db.commit()
    
    # 4. DB에 의해 자동 생성된 ID 등을 포함한 객체를 다시 로드
    db.refresh(db_reservation)
    
    # 5. (중요) JOIN된 데이터를 다시 조회해서 반환
    #    (schemas.Reservation이 user, facility 정보를 요구하기 때문)
    result = db.query(models.Reservation).options(
        joinedload(models.Reservation.user),
        joinedload(models.Reservation.facility)
    ).filter(models.Reservation.reservation_id == db_reservation.reservation_id).first()

    return result


@app.put("/api/reservations/{reservation_id}", response_model=schemas.Reservation)
def update_reservation(
    reservation_id: int, 
    reservation_update: schemas.ReservationUpdate,
    db: Session = Depends(get_db)
):
    """
    기존 예약 수정 (PUT /api/reservations/{id})
    page.tsx의 '1차확인', '2차확인', '상태' 변경 기능
    """
    
    # 1. DB에서 수정할 예약을 찾음
    db_reservation = db.query(models.Reservation).filter(
        models.Reservation.reservation_id == reservation_id
    ).first()

    if db_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # 2. 프론트에서 보낸 수정 데이터(reservation_update)로 필드 값 변경
    #    (주의: 값이 None이 아닌 필드만 업데이트)
    update_data = reservation_update.model_dump(exclude_unset=True)
    
    # page.tsx의 'status1', 'status2'를 DDL의 'approval_1', 'approval_2'로 매핑
    if "status1" in update_data:
        db_reservation.approval_1 = 'approved' if update_data["status1"] == '확인' else 'pending'
    if "status2" in update_data:
        db_reservation.approval_2 = 'approved' if update_data["status2"] == '확인' else 'pending'
    
    # DDL의 status 필드 업데이트
    if "status" in update_data:
        db_reservation.status = update_data["status"]
        
    # DDL의 hvac_mode 필드 업데이트
    if "hvac_mode" in update_data:
        db_reservation.hvac_mode = update_data["hvac_mode"]

    # 3. DB에 커밋 (변경 사항 저장)
    db.commit()
    
    # 4. DB에서 변경된 객체를 다시 로드
    db.refresh(db_reservation)
    
    # 5. JOIN된 데이터를 다시 조회해서 반환
    result = db.query(models.Reservation).options(
        joinedload(models.Reservation.user),
        joinedload(models.Reservation.facility)
    ).filter(models.Reservation.reservation_id == db_reservation.reservation_id).first()

    return result

@app.delete("/api/reservations/{reservation_id}", status_code=204)
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    """
    예약 삭제 (DELETE /api/reservations/{id})
    """
    db_reservation = db.query(models.Reservation).filter(models.Reservation.reservation_id == reservation_id).first()
    
    if db_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
        
    db.delete(db_reservation)
    db.commit()
    # 성공 시 204 No Content 응답 (본문 없음)
    return

# ... (기존 DELETE /api/reservations 코드 바로 아래) ...

# --- 3단계: 관리자 특화 기능 API ---

@app.post("/api/reservations/batch-cancel", status_code=200)
def batch_cancel_reservations(
    payload: schemas.BatchPayload,
    db: Session = Depends(get_db)
):
    """
    예약 일괄 취소 (POST /api/reservations/batch-cancel)
    page.tsx의 '일괄 취소' 버튼 기능
    """
    
    # 1. 프론트에서 받은 ID 목록
    ids_to_cancel = payload.reservation_ids
    
    if not ids_to_cancel:
        return {"message": "No reservation IDs provided"}

    # 2. 해당 ID의 예약들을 찾아서 'status'를 'cancelled'로 변경
    #    (SQL의 "UPDATE ... WHERE id IN (...)")
    updated_count = db.query(models.Reservation).filter(
        models.Reservation.reservation_id.in_(ids_to_cancel)
    ).update(
        {models.Reservation.status: 'cancelled'},
        synchronize_session=False # (중요) 대량 업데이트 시 세션 동기화 비활성화
    )

    # 3. DB에 커밋
    db.commit()

    if updated_count == 0:
        raise HTTPException(status_code=404, detail="No matching reservations found to cancel")

    return {"message": f"Successfully cancelled {updated_count} reservations."}

@app.post("/api/reservations/batch-approve-1", status_code=200)
def batch_approve_1_reservations(
    payload: schemas.BatchPayload,
    db: Session = Depends(get_db)
):
    """
    예약 1차 일괄 승인 (POST /api/reservations/batch-approve-1)
    page.tsx의 '1차확인' -> '일괄 확인' 버튼 기능
    """
    
    ids_to_approve = payload.reservation_ids
    if not ids_to_approve:
        return {"message": "No reservation IDs provided"}

    # approval_1 필드를 'approved'로 업데이트
    updated_count = db.query(models.Reservation).filter(
        models.Reservation.reservation_id.in_(ids_to_approve)
    ).update(
        {models.Reservation.approval_1: 'approved'}, # 'approval_1'을 'approved'로
        synchronize_session=False
    )
    
    db.commit()

    if updated_count == 0:
        raise HTTPException(status_code=404, detail="No matching reservations found")

    return {"message": f"Successfully approved (1st) {updated_count} reservations."}


@app.post("/api/reservations/batch-approve-2", status_code=200)
def batch_approve_2_reservations(
    payload: schemas.BatchPayload,
    db: Session = Depends(get_db)
):
    """
    예약 2차 일괄 승인 (POST /api/reservations/batch-approve-2)
    page.tsx의 '2차확인' -> '일괄 확인' (만약 있다면)
    """
    
    ids_to_approve = payload.reservation_ids
    if not ids_to_approve:
        return {"message": "No reservation IDs provided"}

    # approval_2 필드를 'approved'로 업데이트
    updated_count = db.query(models.Reservation).filter(
        models.Reservation.reservation_id.in_(ids_to_approve)
    ).update(
        {models.Reservation.approval_2: 'approved'}, # 'approval_2'를 'approved'로
        synchronize_session=False
    )
    
    db.commit()

    if updated_count == 0:
        raise HTTPException(status_code=404, detail="No matching reservations found")

    return {"message": f"Successfully approved (2nd) {updated_count} reservations."}

@app.get("/api/reservations/export")
def export_reservations_to_excel(
    db: Session = Depends(get_db),
    # (중요) GET 조회 API와 동일한 필터 파라미터를 받습니다.
    startDate: Optional[datetime] = Query(None),
    endDate: Optional[datetime] = Query(None),
    status: Optional[str] = Query(None)
):
    """
    예약 목록 엑셀 내보내기 (GET /api/reservations/export)
    page.tsx의 '엑셀' 버튼 기능
    """
    
    # 1. 필터 로직 (GET /api/reservations 와 100% 동일)
    query = db.query(models.Reservation).options(
        joinedload(models.Reservation.user),
        joinedload(models.Reservation.facility)
    )

    if startDate:
        query = query.filter(models.Reservation.start_time >= startDate)
    if endDate:
        query = query.filter(models.Reservation.end_time <= endDate.replace(hour=23, minute=59, second=59))
        
    if status and status != "전체":
        if status == "취소": query = query.filter(models.Reservation.status == 'cancelled')
        elif status == "승인": query = query.filter(models.Reservation.status == 'confirmed')
        elif status == "신청중": query = query.filter(models.Reservation.status == 'pending')
        else: query = query.filter(models.Reservation.status == status)

    reservations = query.order_by(models.Reservation.created_at.desc()).all()
    
    # 2. 엑셀 워크북(파일) 생성
    wb = openpyxl.Workbook()
    sheet = wb.active
    
    # 3. 헤더(제목) 행 추가 (page.tsx의 목록과 유사하게)
    sheet.append([
        "ID", "신청일", "신청자", "연락처", "사용단체", 
        "시설명", "행사명", "시작시간", "종료시간", 
        "1차승인", "2차승인", "최종상태"
    ])
    
    # 4. 데이터 행 추가
    for res in reservations:
        sheet.append([
            res.reservation_id,
            res.created_at.strftime("%Y-%m-%d"), # 날짜 형식
            res.user.name,
            res.user.phone,
            res.group_name,
            res.facility.name,
            res.event_name,
            res.start_time.strftime("%Y-%m-%d %H:%M"), # 날짜/시간 형식
            res.end_time.strftime("%Y-%m-%d %H:%M"),   # 날짜/시간 형식
            res.approval_1,
            res.approval_2,
            res.status
        ])

    # 5. 엑셀 파일을 실제 파일이 아닌 '인메모리(RAM)'에 저장
    virtual_workbook = io.BytesIO()
    wb.save(virtual_workbook)
    virtual_workbook.seek(0) # '파일'의 맨 처음으로 커서를 이동

    # 6. 스트리밍 응답으로 파일 다운로드
    return StreamingResponse(
        virtual_workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=reservations_export.xlsx"
        }
    )

# --- 루트 경로 ---
@app.get("/")
def read_root():
    return {"message": "인하대학교 시설 예약 시스템 백엔드 (DB 연결 완료)"}

#
# TODO: POST (생성) / PUT (수정) API 구현
#