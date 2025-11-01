// contexts/ReservationContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// --- 1. 프론트엔드 UI가 사용하는 데이터 구조 (기존과 동일) ---
export interface Reservation {
  id: number;
  date: string;
  no: number;
  facility: string; // 사용단체 (BE: group_name)
  instructor: string; // 행사명 (BE: event_name)
  room: string; // 행사장소 (BE: facility.name)
  eventDate: string; // 사용일 (BE: start_time)
  time: string; // 사용시간 (BE: start_time)
  endTime: string; // 사용종료시간 (BE: end_time)
  status: '신청중' | '승인' | '취소'; // (BE: status)
  dept1: string; // 1차 확인 부서 (Default)
  status1: string; // 1차 확인 (BE: approval_1)
  dept2: string; // 2차 확인 부서 (Default)
  status2: string; // 2차 확인 (BE: approval_2)
  hvacCheckDept: string; // 냉난방 (Default)
  hvacStatus: string; // 냉난방 (BE: hvac_mode)
  roomCat1: string; // (Default)
  roomCat2: string; // (Default)
  roomCat3: string; // (Default)
  orgName: string; // (Default)
  orgMiddleCat: string; // (Default)
  orgDetail: string; // (Default)
  contact: string; // 연락처 (BE: user.phone)
  emailLocal: string; // (BE: user.email)
  emailDomain: string; // (BE: user.email)
  eventHeadcount: string | number; // (Default: 0)
  hvacUsage: string; // (BE: hvac_mode)
  rentalItems: string; // (BE: message)
  statusBroadcast?: 'Y' | 'N'; // (Default: 'N')
}

// --- 2. 백엔드(schemas.py)에서 보내주는 데이터 구조 정의 ---
// (schemas.Reservation과 일치해야 함)
// --- 2. (수정됨) 백엔드에서 보내주는 데이터 구조 정의 ---
interface BackendUser {
  user_id: number;
  email: string;
  name: string;
  phone: string | null;
  // (참고) department 정보는 아직 UI에 표시하지 않음
}
interface BackendFacilityCategory1 {
  name: string;
}
interface BackendFacilityCategory2 {
  name: string;
  category1: BackendFacilityCategory1;
}
interface BackendFacility {
  facility_id: number;
  name: string;
  capacity: number | null;
  category2: BackendFacilityCategory2; // 👈 수정됨
}
interface BackendReservation {
  reservation_id: number;
  user_id: number;
  facility_id: number;
  
  // --- [수정됨] 3. 사용단체 분류 ---
  org_cat1: string | null;
  org_cat2: string | null;
  group_name: string | null;

  event_name: string | null;

  // --- [수정됨] 2. 행사인원 ---
  event_headcount: number | null;

  message: string | null;
  start_time: string; // (ISO datetime string)
  end_time: string; // (ISO datetime string)
  hvac_mode: 'none' | 'heat' | 'cool';

  // --- [수정됨] 1. 확인부서 ---
  hvac_dept: string | null;
  approval_1: 'pending' | 'approved' | 'rejected';
  approval_1_dept: string | null;
  approval_2: 'pending' | 'approved' | 'rejected';
  approval_2_dept: string | null;

  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string; // (ISO datetime string)
  updated_at: string; // (ISO datetime string)
  
  user: BackendUser;
  facility: BackendFacility;
}

// --- 3. (수정됨) 백엔드 데이터 -> 프론트엔드 "번역" 함수 ---
const mapBackendToFrontend = (be: BackendReservation, index: number): Reservation => {
  const startDate = new Date(be.start_time);
  const endDate = new Date(be.end_time);
  const createdAt = new Date(be.created_at);
  
  const [emailLocal, emailDomain] = be.user.email.split('@');

  let feStatus: '신청중' | '승인' | '취소' = '신청중';
  if (be.status === 'confirmed') feStatus = '승인';
  if (be.status === 'cancelled') feStatus = '취소';
  
  let feHvacStatus = '미신청';
  if (be.hvac_mode === 'heat' || be.hvac_mode === 'cool') feHvacStatus = '신청';

  return {
    // --- BE에서 매핑되는 값 ---
    id: be.reservation_id,
    no: index + 1,
    date: createdAt.toISOString().split('T')[0],
    facility: be.group_name || '',        // 👈 '세부 단체명'
    instructor: be.event_name || '',
    room: be.facility.name,
    eventDate: startDate.toISOString().split('T')[0],
    time: startDate.toTimeString().substring(0, 5),
    endTime: endDate.toTimeString().substring(0, 5),
    status: feStatus,
    status1: be.approval_1 === 'approved' ? '확인' : '미확인',
    status2: be.approval_2 === 'approved' ? '확인' : '미확인',
    hvacStatus: feHvacStatus,
    hvacUsage: be.hvac_mode === 'none' ? '미사용' : '사용',
    contact: be.user.phone || '',
    emailLocal: emailLocal || '',
    emailDomain: emailDomain || '',
    rentalItems: be.message || '',

    // --- [수정됨] 새 컬럼 매핑 ---
    dept1: be.approval_1_dept || '', // 👈 'API연동' -> DB 컬럼
    dept2: be.approval_2_dept || '', // 👈 'API연동' -> DB 컬럼
    hvacCheckDept: be.hvac_dept || '', // 👈 'API연동' -> DB 컬럼
    
    roomCat1: be.facility.category2.category1.name,
    roomCat2: be.facility.category2.name,
    roomCat3: be.facility.name,

    orgName: be.org_cat1 || '',      // 👈 '단체분류1'
    orgMiddleCat: be.org_cat2 || '', // 👈 '단체분류2'
    orgDetail: be.group_name || '',    // 👈 '세부 단체명'
    
    eventHeadcount: be.event_headcount || 0, // 👈 '0명' -> DB 컬럼
    statusBroadcast: 'N',
  };
};

// --- (기존과 동일한 부분) ---
type NewReservationData = Omit<Reservation, 'id' | 'no'>;
interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (newReservation: NewReservationData) => void;
  cancelReservation: (reservationId: number) => void;
  updateReservation: (updatedReservation: Reservation) => void;
}
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);
interface ReservationProviderProps {
  children: ReactNode;
}
// --- (여기까지 동일) ---


export function ReservationProvider({ children }: ReservationProviderProps) {
  
  // --- 4. API 로딩 상태 관리 ---
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 중 상태
  
  const API_URL = 'http://localhost:8000/api/reservations';

  // --- 5. (교체됨) localStorage -> API (GET) ---
  // 컴포넌트 마운트 시 *단 1회* API에서 데이터를 가져옴
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        const backendData: BackendReservation[] = await response.json();
        
        // (핵심) 백엔드 데이터를 프론트엔드 형식으로 "번역"
        const frontendData: Reservation[] = backendData
          .map(mapBackendToFrontend)
          .filter(res => res.status !== '취소')
          .sort((a, b) => b.id - a.id); // 최신순 정렬 (ID 내림차순)
          
        setReservations(frontendData);
        
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []); // 빈 배열: 마운트 시 1회만 실행

 // ... (useEffect 함수 바로 아래) ...

  // --- 6. (교체됨) CRUD 함수들 ---

  // --- (교체됨) addReservation 함수 (POST API 연동 - 최종본) ---
  const addReservation = async (newReservation: NewReservationData) => {
    
    // 1. 프론트엔드 폼 데이터 -> 백엔드 API 형식으로 "역-번역"
    // (schemas.ReservationCreate 형식에 맞게)
    const backendCreateData = {
      // (임시 테스트) user_id와 facility_id를 DB에 있는 값으로 고정
      // 🚨 TODO: 로그인 기능 구현 후 실제 user_id로 변경해야 함
      user_id: 1, 
      // 🚨 TODO: facility_id도 폼에서 선택된 roomCat3(시설명)을
      //         실제 facility_id(숫자)로 변환하는 로직이 필요함. (일단 2로 고정)
      facility_id: 2, 

      // --- [수정됨] 새 컬럼 매핑 ---
      // 3. 사용단체 (app/page.tsx의 orgName, orgMiddleCat, facility(finalOrgName) 사용)
      org_cat1: newReservation.orgName,       // 대분류
      org_cat2: newReservation.orgMiddleCat,  // 중분류
      group_name: newReservation.facility,    // 세부 단체명 (finalOrgName)

      // 2. 행사인원 (app/page.tsx의 eventHeadcount 사용)
      event_name: newReservation.instructor,
      event_headcount: Number(newReservation.eventHeadcount) || 0, // 숫자로 변환
      
      message: newReservation.rentalItems,
      start_time: `${newReservation.eventDate}T${newReservation.time}`,
      end_time: `${newReservation.eventDate}T${newReservation.endTime}`,
      hvac_mode: newReservation.hvacUsage === '사용' ? 'cool' : 'none', // (hvacUsage는 '미사용'/'냉방'/'난방' 값을 가짐)

      // 1. 확인부서 (app/page.tsx의 dept1, dept2, hvacCheckDept 사용)
      approval_1_dept: newReservation.dept1,
      approval_2_dept: newReservation.dept2,
      hvac_dept: newReservation.hvacCheckDept,
    };

    try {
      // 2. POST /api/reservations API 호출
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendCreateData),
      });

      if (!response.ok) {
        // 백엔드에서 온 상세 에러 메시지를 표시
        const errorData = await response.json();
        console.error("API Error Data:", errorData);
        throw new Error(`새 예약 생성에 실패했습니다: ${errorData.detail || response.statusText}`);
      }

      // 3. 백엔드에서 생성된 *최신* 예약 정보를 다시 받음 (JOIN 포함)
      const savedBackendData: BackendReservation = await response.json();

      // 4. 받은 최신 데이터를 프론트엔드 형식으로 "번역"
      const newFrontendData = mapBackendToFrontend(savedBackendData, 0); // (no는 임시)

      // 5. 프론트엔드 상태(state) 업데이트
      //    (백엔드에서 받은 실제 데이터로 목록 맨 위에 추가)
      setReservations(prev => {
        // 'no' 번호를 올바르게 다시 매기기
        const renumberedPrev = prev.map(item => ({ ...item, no: item.no + 1 }));
        newFrontendData.no = 1; // 새 항목을 1번으로
        return [newFrontendData, ...renumberedPrev];
      });

    } catch (error) {
      console.error("Failed to create reservation:", error);
      // (TODO: 사용자에게 에러 알림창 띄우기)
    }
  };

  // ... (addReservation 함수 바로 아래) ...

  // --- (교체!) 'DELETE'가 아닌 'PUT'으로 상태 변경 ---
  const cancelReservation = async (reservationId: number) => {
    
    // 1. (UI) 사용자에게 정말 취소할 것인지 확인
    if (!window.confirm("이 예약을 '신청취소' 하시겠습니까?")) {
      return; // 사용자가 '아니오'를 누르면 함수 종료
    }

    // 2. 백엔드에 보낼 데이터: 상태를 'cancelled'로 변경
    const backendUpdateData = {
      status: 'cancelled' // (중요) '삭제'가 아닌 '취소' 상태로
    };

    try {
      // 3. 'DELETE'가 아닌 'PUT' API 호출
      const response = await fetch(`${API_URL}/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendUpdateData),
      });

      if (!response.ok) {
        throw new Error('예약 취소에 실패했습니다.');
      }

      // 4. 백엔드에서 수정된 *최신* 예약 정보를 다시 받음
      const savedBackendData: BackendReservation = await response.json();
      
      // 5. 받은 최신 데이터를 프론트엔드 형식으로 "번역"
      const updatedFrontendData = mapBackendToFrontend(savedBackendData, 0);

      // (cancelReservation 함수 맨 아래)
      // 6. 프론트엔드 상태(state) 업데이트
      //    ('교체'가 아닌 '제거' (filter)로 변경)
      setReservations(prev => 
        prev.filter(res => res.id !== reservationId)
      );

    } catch (error) {
      console.error("Failed to cancel reservation:", error);
    }
  };


  // --- (교체됨) updateReservation 함수 (PUT API 연동) ---
  const updateReservation = async (updatedReservation: Reservation) => {
  // ... (이전 단계에서 수정한 내용) ...
  };

  // --- 7. (로딩 처리) ---
  if (isLoading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  const value: ReservationContextType = {
    reservations,
    addReservation,
    cancelReservation,
    updateReservation,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

// ... (useReservations 훅은 기존과 동일) ...
export function useReservations() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}