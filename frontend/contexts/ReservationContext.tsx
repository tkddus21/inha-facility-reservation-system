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
interface BackendUser {
  user_id: number;
  email: string;
  name: string;
  phone: string | null;
}
interface BackendFacility {
  facility_id: number;
  name: string;
  capacity: number | null;
}
interface BackendReservation {
  reservation_id: number;
  user_id: number;
  facility_id: number;
  group_name: string | null;
  event_name: string | null;
  message: string | null;
  start_time: string; // (ISO datetime string)
  end_time: string; // (ISO datetime string)
  hvac_mode: 'none' | 'heat' | 'cool';
  approval_1: 'pending' | 'approved' | 'rejected';
  approval_2: 'pending' | 'approved' | 'rejected';
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string; // (ISO datetime string)
  updated_at: string; // (ISO datetime string)
  user: BackendUser;
  facility: BackendFacility;
}

// --- 3. (핵심) 백엔드 데이터 -> 프론트엔드 데이터 "번역" 함수 ---
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
  // (참고) '확인' 상태는 page.tsx의 hvacStatus(FE)와 BE의 hvac_mode가 다름.
  //       PUT 로직에서 이 부분을 맞춰줘야 함.
  
  return {
    // --- BE에서 매핑되는 값 ---
    id: be.reservation_id,
    no: index + 1, // (DB에 no 컬럼이 없으므로 임의로 생성)
    date: createdAt.toISOString().split('T')[0], // 'YYYY-MM-DD'
    facility: be.group_name || '단체명 없음',
    instructor: be.event_name || '행사명 없음',
    room: be.facility.name,
    eventDate: startDate.toISOString().split('T')[0], // 'YYYY-MM-DD'
    time: startDate.toTimeString().substring(0, 5), // 'HH:MM'
    endTime: endDate.toTimeString().substring(0, 5), // 'HH:MM'
    status: feStatus,
    status1: be.approval_1 === 'approved' ? '확인' : '미확인', // 'approved' -> '확인'
    status2: be.approval_2 === 'approved' ? '확인' : '미확인', // 'approved' -> '확인'
    hvacStatus: feHvacStatus,
    hvacUsage: be.hvac_mode === 'none' ? '미사용' : '사용',
    contact: be.user.phone || '연락처 없음',
    emailLocal: emailLocal || '',
    emailDomain: emailDomain || '',
    rentalItems: be.message || '',

    // --- BE에 없는 값 (UI를 위한 기본값) ---
    dept1: 'API연동(1차)',
    dept2: 'API연동(2차)',
    hvacCheckDept: 'API연동(냉난방)',
    roomCat1: '시설분류1',
    roomCat2: '시설분류2',
    roomCat3: be.facility.name,
    orgName: '단체분류1',
    orgMiddleCat: '단체분류2',
    orgDetail: be.group_name || '',
    eventHeadcount: be.facility.capacity || 0,
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

  // --- 6. (교체 필요) CRUD 함수들 ---
  // (TODO: 이 함수들을 API (POST, PUT, DELETE) 호출로 변경해야 함)
  // (일단은 로컬에서만 작동하도록 둠)

  const addReservation = (newReservation: NewReservationData) => {
    // (TODO: POST /api/reservations 호출)
    console.log("TODO: API로 예약 생성", newReservation);
    // (임시 로컬 업데이트)
    setReservations(prev => {
      const newId = Date.now();
      const newNo = prev.length > 0 ? Math.max(...prev.map(r => r.no)) + 1 : 1;
      const reservationWithId: Reservation = {
          ...newReservation,
          id: newId,
          no: newNo
      };
      return [reservationWithId, ...prev];
    });
  };

  const cancelReservation = (reservationId: number) => {
    // (TODO: DELETE /api/reservations/{id} 호출)
    console.log("TODO: API로 예약 삭제", reservationId);
    // (임시 로컬 업데이트)
    setReservations(prev => prev.filter(res => res.id !== reservationId));
  };

  const updateReservation = (updatedReservation: Reservation) => {
    // (TODO: PUT /api/reservations/{id} 호출)
    console.log("TODO: API로 예약 수정", updatedReservation);
    // (임시 로컬 업데이트, 기존 로직 유지)
    setReservations(prev => 
      prev.map(res => {
        if (res.id !== updatedReservation.id) {
          return res;
        }
        // ... (기존의 '승인' 상태 변경 로직) ...
        const newReservationData = { ...updatedReservation };
        if (newReservationData.status !== '취소') {
            const isHvacConfirmed = 
                newReservationData.hvacUsage === '미사용' || 
                (newReservationData.hvacUsage !== '미사용' && newReservationData.hvacStatus === '확인');
            if (newReservationData.status1 === '확인' && 
                newReservationData.status2 === '확인' && 
                isHvacConfirmed) 
            {
                newReservationData.status = '승인';
            }
        }
        return newReservationData;
      })
    );
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