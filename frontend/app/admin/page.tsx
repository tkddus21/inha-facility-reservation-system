'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { useReservations, Reservation } from '@/contexts/ReservationContext';

export default function AdminPage() {
  const { reservations, updateReservation } = useReservations();

  // 상단 필터 상태
  const [searchStartDate, setSearchStartDate] = useState('2025-10-01');
  const [searchEndDate, setSearchEndDate] = useState('2025-11-30');
  const [searchStatus, setSearchStatus] = useState('전체');

  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<Reservation | null>(null);

  const handleSearch = () => {
    const filtered = reservations.filter(res => {
      const eventDate = new Date(res.eventDate);
      const start = new Date(searchStartDate);
      const end = new Date(searchEndDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      const isDateMatch = eventDate >= start && eventDate <= end;
      const isStatusMatch = searchStatus === '전체' || res.status === searchStatus;
      
      return isDateMatch && isStatusMatch;
    });

    setFilteredReservations(filtered);
    // 폼 초기화 버그 방지를 위해 null로 설정하는 코드 제거됨
  };

  useEffect(() => {
    handleSearch();
  }, [reservations, searchStartDate, searchEndDate, searchStatus]);


  const handleAdminRowClick = (reservation: Reservation) => {
    setSelectedDetails(reservation);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!selectedDetails) return;

    let newStatus = selectedDetails.status;
    if (name === 'statusApplicationCancel') {
      newStatus = value === 'Y' ? '취소' : (selectedDetails.status === '취소' ? '신청중' : selectedDetails.status);
    }

    const updatedDetails: Reservation = {
      ...selectedDetails,
      [name]: value,
      status: newStatus,
    };
    
    setSelectedDetails(updatedDetails);
    updateReservation(updatedDetails);
  };


  const handleBulkAction = (action: string) => {
    if (action === '1차확인' && selectedDetails) {
       handleStatusChange({ target: { name: 'status1', value: '확인' } } as React.ChangeEvent<HTMLSelectElement>);
    }
    console.log(`일괄 ${action} 처리`);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col">
      
      {/* 1. 상단 검색/필터 영역 (크기 고정) */}
      <div className="bg-white p-3 border border-gray-300 rounded mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="usagePeriod">사용기간:</label>
            <input type="date" id="usagePeriodStart" value={searchStartDate} onChange={(e) => setSearchStartDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs"/>
            <span>~</span>
            <input type="date" id="usagePeriodEnd" value={searchEndDate} onChange={(e) => setSearchEndDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs"/>
            <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs ml-2">
              <option>전체</option>
              <option>신청중</option>
              <option>승인</option>
              <option>취소</option>
            </select>
            <button onClick={handleSearch} className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"> 조회 </button>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button onClick={() => handleBulkAction('메세지 발송')} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">일괄 메세지 발송</button>
            <button onClick={() => handleBulkAction('일괄 취소')} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">일괄 취소</button>
            <button onClick={() => handleBulkAction('엑셀')} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">엑셀</button>
          </div>
        </div>
      </div>

      {/* 2. 검색 결과 표시 영역 (남은 공간 모두 차지) */}
      <div className="bg-white p-3 border border-gray-300 rounded mb-4 text-sm flex-1 flex flex-col overflow-hidden">
        {filteredReservations.length === 0 ? (
          <p className="text-gray-500">조회된 Data가 존재하지 않습니다.</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs text-left table-auto">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2 border-b">신청일자</th>
                  <th className="p-2 border-b">사용단체</th>
                  <th className="p-2 border-b">행사명</th>
                  <th className="p-2 border-b">행사장소</th>
                  <th className="p-2 border-b">시작일</th>
                  <th className="p-2 border-b">시작시간</th>
                  <th className="p-2 border-b">1차</th>
                  <th className="p-2 border-b">2차</th>
                  <th className="p-2 border-b">상태</th>
                  <th className="p-2 border-b">연락처</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(res => (
                  <tr
                    key={res.id}
                    onClick={() => handleAdminRowClick(res)}
                    className={`cursor-pointer hover:bg-blue-50 ${selectedDetails?.id === res.id ? 'bg-blue-100' : ''}`}
                  >
                    <td className="p-2 border-b">{res.date}</td>
                    <td className="p-2 border-b">{res.facility}</td>
                    <td className="p-2 border-b">{res.instructor}</td>
                    <td className="p-2 border-b">{res.room}</td>
                    <td className="p-2 border-b">{res.eventDate}</td>
                    <td className="p-2 border-b">{res.time}</td>
                    <td className="p-2 border-b">{res.status1}</td>
                    <td className="p-2 border-b">{res.status2}</td>
                    <td className="p-2 border-b">{res.status}</td>
                    <td className="p-2 border-b">{res.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. 하단 상세 정보 영역 (크기 고정) */}
      <div className="bg-white p-3 border border-gray-300 rounded flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">신청일</label> <input type="text" value={selectedDetails ? selectedDetails.date : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">사용기간</label> <input type="text" value={selectedDetails ? selectedDetails.eventDate : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> <span className="mx-1">~</span> <input type="text" value={selectedDetails ? selectedDetails.eventDate : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">행사장소</label> <input type="text" value={selectedDetails ? selectedDetails.room : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">단체명</label> <input type="text" value={selectedDetails ? selectedDetails.orgName : ''} readOnly className="w-1/3 border border-gray-300 rounded-l px-2 py-1 text-xs bg-gray-100"/> <span className="border-t border-b border-gray-300 px-1 text-gray-400">/</span> <input type="text" value={selectedDetails ? selectedDetails.orgMiddleCat : ''} readOnly className="w-1/3 border-t border-b border-r border-gray-300 px-2 py-1 text-xs bg-gray-100"/> <span className="mx-1">/</span> <input type="text" value={selectedDetails ? selectedDetails.orgDetail : ''} readOnly className="flex-1 border border-gray-300 rounded-r px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">사용단체</label> <input type="text" value={selectedDetails ? selectedDetails.facility : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
             <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">기안자</label> <input type="text" value={selectedDetails ? '김인하' : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">사용시간</label> <input type="text" value={selectedDetails ? selectedDetails.time : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> <span className="mx-1">~</span> <input type="text" value={selectedDetails ? selectedDetails.endTime : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">기타장소</label> <input type="text" value={""} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">인원</label> <input type="text" value={selectedDetails ? selectedDetails.eventHeadcount : ''} readOnly className="w-16 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100 text-right"/> <span className="ml-1">명</span> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">행사명</label> <input type="text" value={selectedDetails ? selectedDetails.instructor : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
          </div>

           {/* Col 3 */}
          <div className="space-y-2">
             <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">연락처</label> <input type="text" value={selectedDetails ? selectedDetails.contact : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
             <div></div> <div></div> <div></div> {/* Empty divs for spacing */}
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">대여물품</label> <input type="text" value={selectedDetails ? selectedDetails.rentalItems : ''} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
            <div className="flex items-center"> <label className="w-20 font-medium text-gray-700">방송기자재</label> <input type="text" value={""} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
          </div>

           {/* Col 4 */}
           <div className="space-y-1">
             <div className="flex items-center justify-end gap-2">
                 <span className="text-xs font-medium">1차확인</span>
                 <select 
                   name="status1"
                   value={selectedDetails ? selectedDetails.status1 : '미확인'} 
                   onChange={handleStatusChange}
                   disabled={!selectedDetails}
                   className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                 >
                     <option>미확인</option> <option>확인</option>
                 </select>
                 <button onClick={() => handleBulkAction('1차확인')} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">일괄 확인</button>
             </div>
              <div className="flex items-center justify-end gap-2">
                 <span className="text-xs font-medium">2차확인</span>
                  <select 
                    name="status2"
                    value={selectedDetails ? selectedDetails.status2 : '미확인'} 
                    onChange={handleStatusChange}
                    disabled={!selectedDetails}
                    className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                  >
                     <option>미확인</option> <option>확인</option>
                 </select>
             </div>
              <div className="flex items-center justify-end gap-2">
                 <span className="text-xs font-medium">신청취소</span>
                  <select 
                    name="statusApplicationCancel"
                    value={selectedDetails ? (selectedDetails.status === '취소' ? 'Y' : 'N') : 'N'} 
                    onChange={handleStatusChange}
                    disabled={!selectedDetails}
                    className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                  >
                     <option value="N">N</option> <option value="Y">Y</option>
                 </select>
             </div>
             <div className="flex items-center justify-end gap-2">
                 <span className="text-xs font-medium">냉난방확인</span>
                  <select 
                    name="hvacStatus"
                    value={selectedDetails ? selectedDetails.hvacStatus : '미신청'} 
                    onChange={handleStatusChange}
                    disabled={!selectedDetails}
                    className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                  >
                     <option>미신청</option> <option>신청</option> <option>확인</option>
                 </select>
             </div>
             <div className="flex items-center justify-end gap-2">
                 <span className="text-xs font-medium">방송기자재확인</span>
                  <select 
                    name="statusBroadcast"
                    value={selectedDetails ? (selectedDetails as any).statusBroadcast || 'N' : 'N'}
                    onChange={handleStatusChange}
                    disabled={!selectedDetails}
                    className="border border-gray-300 rounded px-1 py-0.5 text-xs"
                  >
                     <option value="N">N</option> <option value="Y">Y</option>
                 </select>
             </div>
             <div className="flex items-center pt-2"> <label className="w-20 font-medium text-gray-700">취소일</label> <input type="text" value={""} readOnly className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100"/> </div>
             <div className="flex items-center pt-1"> <input type="checkbox" id="adminInputCheck" checked={false} readOnly className="mr-1"/> <label htmlFor="adminInputCheck" className="text-xs font-medium">관리자 입력사항</label> </div>
             <div className="flex items-center justify-start gap-3 pt-1 text-xs">
                 <label><input type="checkbox" checked={selectedDetails?.status1 === '확인'} readOnly/> 1차확인</label>
                 <label><input type="checkbox" checked={selectedDetails?.status2 === '확인'} readOnly/> 2차확인</label>
                 <label><input type="checkbox" checked={selectedDetails?.hvacStatus === '확인'} readOnly/> 냉난방확인</label>
                 <label><input type="checkbox" checked={(selectedDetails as any)?.statusBroadcast === 'Y'} readOnly/> 방송기자재확인</label>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}