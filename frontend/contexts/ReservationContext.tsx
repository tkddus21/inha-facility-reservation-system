// contexts/ReservationContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// ... (Reservation, NewReservationData, ReservationContextType 인터페이스는 기존과 동일) ...
export interface Reservation {
  id: number;
  date: string;
  no: number;
  facility: string;
  instructor: string;
  room: string;
  eventDate: string;
  time: string;
  endTime: string;
  status: '신청중' | '승인' | '취소';
  dept1: string;
  status1: string;
  dept2: string;
  status2: string;
  hvacCheckDept: string;
  hvacStatus: string;
  roomCat1: string;
  roomCat2: string;
  roomCat3: string;
  orgName: string;
  orgMiddleCat: string;
  orgDetail: string;
  contact: string;
  emailLocal: string;
  emailDomain: string;
  eventHeadcount: string | number;
  hvacUsage: string;
  rentalItems: string;
  statusBroadcast?: 'Y' | 'N';
}
type NewReservationData = Omit<Reservation, 'id' | 'no'>;
interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (newReservation: NewReservationData) => void;
  cancelReservation: (reservationId: number) => void;
  updateReservation: (updatedReservation: Reservation) => void;
}


// ... (Context 생성, Provider Props, 샘플 데이터, STORAGE_KEY는 기존과 동일) ...
const ReservationContext = createContext<ReservationContextType | undefined>(undefined);
interface ReservationProviderProps {
  children: ReactNode;
}
const initialSampleData: Reservation[] = [
  {
    id: 1, date: '2025-09-29', no: 62, facility: 'SINSA 인공지능학회', instructor: '핸즈온 머신_러닝 스터디', room: '해동스터디룸A(하-132A)', eventDate: '2025-10-02', time: '19:00', endTime: '20-19', status: '승인',
    dept1: '공과대학 행정실', status1: '확인', dept2: '공과대학 행정실', status2: '확인', hvacCheckDept: '미신청', hvacStatus: '미신청',
    roomCat1: '스터디룸', roomCat2: '해동스터디룸', roomCat3: '해동스터디룸A(하-132A)',
    orgName: '학생자치기구', orgMiddleCat: 'SINSA 인공지능학회', orgDetail: 'SINSA 인공지능학회',
    contact: '010-0000-0001', emailLocal: 'sinsa', emailDomain: 'inha.ac.kr',
    eventHeadcount: '15', hvacUsage: '미사용', rentalItems: ''
  },
  // ... (다른 샘플 데이터들) ...
];
const STORAGE_KEY = 'inha_reservations';


export function ReservationProvider({ children }: ReservationProviderProps) {
  
  // --- [수정 1] ---
  // 초기 상태를 localStorage가 아닌 'initialSampleData'로 고정합니다.
  // 이렇게 하면 서버와 클라이언트의 첫 렌더링 내용이 무조건 일치하게 됩니다.
  const [reservations, setReservations] = useState<Reservation[]>(initialSampleData);

  
  // --- [수정 2] useEffect 로직 분리 ---

  // (NEW) 클라이언트 마운트(Hydration) 이후 localStorage 데이터 로드
  // 이 훅은 클라이언트에서만, 그리고 렌더링이 완료된 후 *단 한 번* 실행됩니다.
  useEffect(() => {
    // 서버 사이드 렌더링 중에는 window 객체가 없으므로 즉시 종료
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const storedItems = window.localStorage.getItem(STORAGE_KEY);
      if (storedItems) {
        // localStorage에서 읽어온 실제 데이터로 상태를 업데이트합니다.
        // 이때 화면이 다시 렌더링됩니다.
        setReservations(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("LocalStorage 읽기 오류:", error);
    }
  }, []); // 빈 배열[]: 마운트 시 1회만 실행

  // (EXISTING) 'reservations' 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // 2025-09-29 데이터가 2025-10-29 데이터로 덮어쓰는 것을 방지하기 위해
      // 초기 샘플 데이터와 현재 상태가 다를 때만 저장하는 조건을 추가할 수 있으나,
      // 단순함을 위해 매번 저장해도 문제는 없습니다.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (error) {
      console.error("LocalStorage 쓰기 오류:", error);
    }
  }, [reservations]); // 'reservations' 상태가 바뀔 때마다 실행

  // (EXISTING) 다른 탭 간의 동기화 리스너
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setReservations(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Storage 이벤트 처리 오류:", error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  // --- [END] ---


  // ... (addReservation, cancelReservation, updateReservation 함수는 기존과 동일) ...
  const addReservation = (newReservation: NewReservationData) => {
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
    setReservations(prev => prev.filter(res => res.id !== reservationId));
  };

  const updateReservation = (updatedReservation: Reservation) => {
    setReservations(prev => 
      prev.map(res => {
        if (res.id !== updatedReservation.id) {
          return res;
        }

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