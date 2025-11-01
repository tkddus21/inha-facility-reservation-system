// contexts/ReservationContext.tsx
'use client';

// 나중에 apiBase를 .env로 관리할 때 사용 frontend/.env.local 파일 만들어서 사용 가능
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
const RESV_URL = `${API_BASE}/api/reservations`;

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
    hvacUsage: be.hvac_mode === 'heat' ? '난방' : be.hvac_mode === 'cool' ? '냉방' : '미신청',
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

// FE -> BE 매핑 (생성/수정용)
type NewReservationData = Omit<Reservation, 'id' | 'no'> & {
  facilityId: number; // ★ UI에서 시설 선택 시 id도 보관하도록
};

const toIso = (date: string, hhmm: string) => {
  // 값이 비었으면 null 리턴
  if (!date || !hhmm) return null;

  // 안전한 분해
  const [y, m, d] = date.split('-');
  const [h, min] = hhmm.split(':');
  if (!y || !m || !d || !h || !min) {
    console.warn('Invalid date/time inputs:', date, hhmm);
    return null;
  }

  // FastAPI가 naive datetime 받으므로 그대로 문자열 반환
  return `${y}-${m}-${d}T${h}:${min}:00`;
};

const hvacMap = (v: string) => (v === '냉방' ? 'cool' : v === '난방' ? 'heat' : 'none');
const statusMap = (v: string) => (v === '승인' ? 'confirmed' : v === '취소' ? 'cancelled' : 'pending');
const approveMap = (v: string) => (v === '확인' ? 'approved' : 'pending');

// FE → BE (POST/PUT 바디 만들 때 사용)
const mapFrontendToBackend = (fe: any) => ({
  facility_id: fe.facilityId,                // ★ 드롭다운 value로 받아오기
  group_name: fe.finalOrgName,               // 사용단체
  event_name: fe.eventTitle,                 // 행사명
  message: fe.rentalItems ?? null,           // 요청/메모
  start_time: toIso(fe.reservationDate, fe.startTime),
  end_time: toIso(fe.reservationDate, fe.endTime),
  hvac_mode: hvacMap(fe.hvacUsage),
  approval_1: approveMap(fe.status1 || '미확인'),
  approval_2: approveMap(fe.status2 || '미확인'),
  status: statusMap(fe.status || '신청중'),
  // user_id는 백엔드에서 토큰으로 추출하거나 임시 사용자 1로 처리
});

export interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (form: NewReservationData) => Promise<void>;
  updateReservation: (id: number, form: NewReservationData) => Promise<void>;
  cancelReservation: (id: number) => Promise<void>;
  batchCancel: (ids: number[]) => Promise<void>;
  batchApprove1: (ids: number[]) => Promise<void>;
  batchApprove2: (ids: number[]) => Promise<void>;
  exportExcel: () => Promise<void>;
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
  useEffect(() => { fetchReservations(); }, []);

  // --- 6. (교체 필요) CRUD 함수들 ---
  // (TODO: 이 함수들을 API (POST, PUT, DELETE) 호출로 변경해야 함)
  // (일단은 로컬에서만 작동하도록 둠)

// 생성
// POST
const addReservation = async (form: NewReservationData) => {
  const body = mapFrontendToBackend({ ...form, status: '신청중', status1: '미확인', status2: '미확인' });
  const r = await fetch(RESV_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!r.ok) throw new Error('예약 생성 실패');
  const be: BackendReservation = await r.json();
  const fe = mapBackendToFrontend(be, 0);
  setReservations(prev => [{ ...fe, no: (prev[0]?.no ?? 0) + 1 }, ...prev]);
  };
  // 수정
  // PUT
  const updateReservation = async (id: number, form: NewReservationData) => {
    const r = await fetch(`${RESV_URL}/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(mapFrontendToBackend(form)) });
    if (!r.ok) throw new Error('예약 수정 실패');
    const be: BackendReservation = await r.json();
    const fe = mapBackendToFrontend(be, 0);
    setReservations(prev => prev.map(x => (x.id === fe.id ? { ...fe, no: x.no } : x)));
  };
  // 삭제(취소)
  const cancelReservation = async (id: number) => {
    const r = await fetch(`${RESV_URL}/${id}`, { method:'DELETE' });
    if (!r.ok) throw new Error('예약 취소 실패');
    setReservations(prev => prev.filter(x => x.id !== id));
  };

  const postIds = (path: string, ids: number[]) =>
  fetch(`${RESV_URL}/${path}`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ reservation_ids: ids }),
  });

  const batchCancel   = async (ids: number[]) => { const r = await postIds('batch-cancel', ids);   if (!r.ok) throw new Error('일괄 취소 실패'); await fetchReservations(); };
  const batchApprove1 = async (ids: number[]) => { const r = await postIds('batch-approve-1', ids); if (!r.ok) throw new Error('1차 승인 실패'); await fetchReservations(); };
  const batchApprove2 = async (ids: number[]) => { const r = await postIds('batch-approve-2', ids); if (!r.ok) throw new Error('2차 승인 실패'); await fetchReservations(); };
  
  const exportExcel = async () => {
    const r = await fetch(`${RESV_URL}/export`);
    if (!r.ok) throw new Error('엑셀 실패');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reservations_${new Date().toISOString().slice(0,10)}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
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
    batchCancel,
    batchApprove1,
    batchApprove2,
    exportExcel,
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