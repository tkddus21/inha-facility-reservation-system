#  Inha Facility Reservation System  
**인하대학교 시설 예약 통합 및 관리 시스템 (FastAPI + React 기반 웹 애플리케이션)**  

---

## 1.  프로젝트 개요  
본 프로젝트는 인하대학교 내의 다양한 시설(강의실, 스터디룸, 체육시설 등)을  
**온라인으로 예약·승인·관리할 수 있는 통합 플랫폼**입니다.  

기존의 **오프라인·서류 기반 절차**와 **교직원 수동 승인 부담**을 개선하여,  
**학생과 관리자 모두에게 효율적인 예약 경험**을 제공합니다.

---

## 2.  주요 기능

###  학생 (Student)
- **간편 예약 신청**: ‘대/중/소’ 3단계 분류를 통한 직관적인 시설 선택  
- **즉각적인 피드백**: 자동 승인 규칙에 따라 ‘승인’ 또는 ‘거부’ 상태를 즉시 확인  
- **온라인 전환**: 오프라인 동의 절차(기물 파손 등)를 온라인 체크리스트로 대체  
- **편의 기능**:  
  - ‘최근 내역 불러오기’ (날짜만 변경)  
  - ‘월별/주별 현황’ 모달  
  - ‘관련 부서 연락처’ 제공  

###  관리자 (Admin)
- **선택 항목 일괄 승인**:  
  ‘신청중’ 목록에서 다중 선택 후 한 번에 **1차 → 2차 → 최종 승인** 처리  
- **자동 승인 규칙 관리 (On/Off)**  
  - 시설 분류별 자동 승인 On/Off (예: 스터디룸 전체 승인)  
  - 특정 학번/단체 기반 수동 승인·거부 설정  
- **통합 관리**:  
  - 예약 현황을 날짜/상태별로 필터링  
  - **엑셀 내보내기** 기능 지원  

---

## 3.  기술 스택

| 영역 | 기술 |
|------|------|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy |
| **Frontend** | React 18 (Next.js), TypeScript, Context API, Tailwind CSS |
| **Database** | MySQL 8.0 |
| **Environment** | Docker, Nginx (예정) |

---

## 4.  프로젝트 구조
```plaintext
inha-facility-reservation-system/
├── backend/
│   ├── database.py         # DB 세션 및 엔진 설정
│   ├── main.py             # FastAPI 라우터 (API 엔드포인트)
│   ├── models.py           # SQLAlchemy 테이블 모델
│   ├── schemas.py          # Pydantic 검증 스키마
│   └── requirements.txt
│
├── frontend/
│   ├── components/
│   │   ├── AdminPage.tsx
│   │   ├── InhaPortal.tsx
│   │   └── RuleModal.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ReservationContext.tsx
│   ├── app/
│   │   ├── admin/page.tsx
│   │   └── page.tsx
│   └── package.json
│
├── (DB_Setup)/
│   ├── 01_schema.sql       # 테이블 생성 DDL
│   └── 02_data.sql         # 샘플 데이터 DML
│
└── README.md
```

## 5.  설치 및 실행 가이드

---

###  1. Database (MySQL)
1. **데이터베이스 생성:**  
   MySQL 워크벤치 또는 터미널에서 `inha_reserv` 데이터베이스를 생성합니다.  
   (문자 인코딩: `utf8mb4`)

2. **테이블 및 제약조건 생성:**  
   제출 파일 내 `01_schema.sql`을 실행하여 모든 테이블과 제약조건을 생성합니다.

3. **샘플 데이터 삽입:**  
   `02_data.sql`을 실행하여 샘플 사용자 및 시설 데이터를 삽입합니다.

---

###  2. Backend (FastAPI)
```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # (Windows: .venv\Scripts\activate)

# 3. 의존성 설치
pip install -r requirements.txt

# 4. (중요) .env 파일 설정
# .env 파일을 생성하고 DB 접속 정보(MYSQL_URL 등)를 입력합니다.

# 5. 서버 실행
uvicorn main:app --reload
# (서버가 http://localhost:8000 에서 실행됩니다.)
```
###  3. Frontend (Next.js)
```bash
# 1. 프론트엔드 디렉토리로 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
# (서버가 http://localhost:3000 에서 실행됩니다.)
```

## 6.  테스트 방법

---

###  학생 (Student)

**로그인 정보**
- ID: `20211234`  
- PW: `student1234`  
- 이름: 김건우  
- 접속 주소: [http://localhost:3000](http://localhost:3000)

#### 테스트 항목

1. **수동 승인 테스트**
   - ‘시설 예약’ 탭에서 **행사장소 → 강의실** 선택  
   - ‘신청’ 버튼 클릭  
   - 예약 상태가 **`신청중`** 으로 표시되는지 확인  

2. **시설 분류 자동 승인 테스트**
   - ‘신규’ 버튼 클릭  
   - **행사장소 → 스터디룸** 선택  
   - ‘신청’ 버튼 클릭  
   - [시설 분류 자동 승인 규칙]에 따라 즉시 **`승인`** 상태로 변경되는지 확인  

3. **기능 점검**
   - ‘신청취소’ 버튼 정상 작동 여부 확인  
   - ‘최근 내역 불러오기’ 버튼이 정상적으로 작동하는지 확인  

---

###  관리자 (Admin)

**로그인 정보**
- ID: `admin001`  
- PW: `adminpass`  
- 이름: 김인하  
- 접속 주소: [http://localhost:3000/admin](http://localhost:3000/admin)

#### 테스트 항목

1. **자동 승인 On/Off 스위치 테스트**
   - ‘자동 규칙 관리’ 버튼 클릭  
   - ‘시설 분류별 자동 승인’ 탭에서 **스터디룸 자동 승인 OFF(체크 해제)**  
   - 학생 계정으로 다시 스터디룸 예약 시, 예약 상태가 **`신청중`** 으로 표시되는지 확인  

2. **선택 일괄 승인 테스트**
   - ‘신청중’ 상태의 예약 2건 이상 선택  
   - **✔️ 선택 일괄 승인** 버튼 클릭  
   - “총 2건의 예약이 일괄 승인되었습니다.” 알림창이 표시되는지 확인  
   - 새로고침 없이도 해당 항목의 상태가 즉시 **`승인`** 으로 변경되는지 확인  

3. **엑셀 내보내기 테스트**
   - ‘엑셀 내보내기’ 버튼 클릭  
   - `reservations_export.xlsx` 파일이 정상적으로 다운로드되는지 확인  

---

✅ **Tip:**  
테스트는 **로컬 환경(`localhost`)** 기준으로 진행됩니다.  
- **Backend:** http://localhost:8000  
- **Frontend:** http://localhost:3000  
두 서버가 모두 실행 중이어야 정상 테스트가 가능합니다.

