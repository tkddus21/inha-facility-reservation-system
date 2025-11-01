'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Minus, Calendar } from 'lucide-react';
// --- [MODIFIED] useReservations import ---
import { useReservations } from '@/contexts/ReservationContext'; // 경로 확인!

// --- Helper Functions ---
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) days.push(null);
  }
  return days;
};

// --- Room Category Options ---
const roomCat1Options = ['스터디룸', '체육시설', '가무연습실', '강의실'];

const roomCat2Options = {
  '스터디룸': ['인문스터디룸', '해동스터디룸', '학생라운지스터디룸'],
  '체육시설': ['운동장', '테니스장', '농구장', '풋살파크', '피클볼'],
  '가무연습실': ['학생회관403호', '학생회관404호', '학생회관406호'],
  '강의실': ['5호관', '하이테크관'],
};

const roomCat3Options = {
  '인문스터디룸': ['인문스터디룸B(5남-032B)', '인문스터디룸C(5남-032C)', '인문스터디룸D(5남-032D)', '인문스터디룸E(5남-032E)', '인문스터디룸F(5남-032F)'],
  '해동스터디룸': ['해동스터디룸A(하-132A)', '해동스터디룸B(하-132B)', '해동스터디룸C(하-132C)', '해동스터디룸D(하-132D)', '해동스터디룸E(하-132E)', '해동스터디룸F(하-132F)', '해동스터디룸G(하-132G)'],
  '학생라운지스터디룸': ['학생라운지스터디룸(하-021)'],
  '운동장': ['운동장(축구장)', '운동장(다목적구장 1(학군단쪽))', '운동장(다목적구장 2(5남쪽))'],
  '테니스장': ['제1테니스장 3번', '제1테니스장 4번', '제1테니스장 5번', '제2테니스장 6번', '제2테니스장 7번', '제2테니스장 8번'],
  '농구장': ['농구장 1면(야구장쪽에서 첫번째)', '농구장 2면(야구장쪽에서 두번째)', '농구장 3면(야구장쪽에서 세번째)', '농구장 4면(야구장쪽에서 네번째)'],
  '풋살파크': ['인하풋살파크A', '인하풋살파크D'],
  '피클볼': ['피클볼 1코트', '피클볼 2코트(우레탄)', '피클볼 3코트', '피클볼 4코트', '피클볼 5코트'],
  '5호관': ['5남-101', '5남-102', '5남-201', '5남-202'],
  '하이테크관': ['하-101', '하-102', '하-201', '하-202'],
};


export default function InhaPortal() {
  // --- [MODIFIED] Get data from context ---
  const { reservations, addReservation, cancelReservation } = useReservations();

  const [selectedMenu, setSelectedMenu] = useState('시설');
  const [expandedMenus, setExpandedMenus] = useState({
    '학적': false, '수업': false, '장학': false, '등록': false, '비교과과정': false,
    '성적': false, '교직': false, '학생': false, '(대학원)학적': false, '연구활동': false,
    '시설': true, '생활관': false, '예비군': false
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOrgSearchModal, setShowOrgSearchModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [viewMode, setViewMode] = useState('month');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedRoom, setSelectedRoom] = useState(roomCat3Options['인문스터디룸'][1]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [applicationDate, setApplicationDate] = useState('');
  const [dept1, setDept1] = useState('');
  const [status1, setStatus1] = useState('');
  const [dept2, setDept2] = useState('');
  const [status2, setStatus2] = useState('');
  const [hvacCheckDept, setHvacCheckDept] = useState('');
  const [hvacStatus, setHvacStatus] = useState('');

  const [roomCat1, setRoomCat1] = useState('');
  const [roomCat2, setRoomCat2] = useState('');
  const [roomCat3, setRoomCat3] = useState('');
  const [selectedRoomForm, setSelectedRoomForm] = useState('');

  const [pickerDate, setPickerDate] = useState(new Date());
  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [orgName, setOrgName] = useState('');
  const [orgMiddleCat, setOrgMiddleCat] = useState('');
  const [orgDetail, setOrgDetail] = useState('');
  const [finalOrgName, setFinalOrgName] = useState('');
  const [contact, setContact] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [emailDomain, setEmailDomain] = useState('직접입력');
  const [eventTitle, setEventTitle] = useState('');
  const [eventHeadcount, setEventHeadcount] = useState('');
  const [hvacUsage, setHvacUsage] = useState('미사용');
  const [rentalItems, setRentalItems] = useState('');

  const [checkedTerms1, setCheckedTerms1] = useState(false);
  const [checkedTerms2, setCheckedTerms2] = useState(false);
  const [checkedTerms3, setCheckedTerms3] = useState(false);
  const [checkedTerms4, setCheckedTerms4] = useState(false);
  const [checkedTerms5, setCheckedTerms5] = useState(false);

  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  // --- [REMOVED] Local reservations state ---
  // const [reservations, setReservations] = useState([ ... ]); // 이 줄이 삭제되었습니다.

  // PDF 생성 함수 (Context의 reservations를 사용하도록 자동 수정됨)
  const generatePDF = () => {
     const printWindow = window.open('', '_blank');
     const daysData = getCalendarDays(parseInt(selectedYear), parseInt(selectedMonth));
     const weeksData = [];
     for (let i = 0; i < daysData.length; i += 7) weeksData.push(daysData.slice(i, i + 7));

     const getReservationsForDayPDF = (day) => {
        if (!day) return [];
        const filtered = reservations.filter(res => { // Context의 reservations 사용
          if (res.room !== selectedRoom) return false;
          const [resYear, resMonth] = res.eventDate.split('-').map(Number);
          return resYear === parseInt(selectedYear) && resMonth === parseInt(selectedMonth) && parseInt(res.eventDate.split('-')[2], 10) === day;
        });
        filtered.sort((a, b) => a.time.localeCompare(b.time));
        return filtered.map(res => {
          const displayEndTime = ['09', '19', '29', '39', '49', '59'].includes(res.endTime.substring(3, 5)) ? res.endTime : res.endTime;
          return `[${res.time}~${displayEndTime}]${res.instructor}(${res.facility})`;
        });
      };

     printWindow.document.write(`<!DOCTYPE html><html><head><title>${selectedYear}년 ${selectedMonth}월 현황</title>
        <style>
          body{font-family:"맑은 고딕",Arial;padding:10px;}
          h1{font-size:16px;margin-bottom:5px;}
          h2{font-size:12px;color:#666;margin-bottom:15px;}
          table{width:100%;border-collapse:collapse;table-layout:fixed;}
          th,td{border:1px solid #000;padding:4px;vertical-align:top;word-wrap:break-word;}
          thead th { background:#f0f0f0; font-weight:bold; font-size: 9px; padding: 2px 4px; height: auto; }
          td { height: 80px; }
          .day-number{font-weight:bold;font-size:10px;margin-bottom:3px;}
          .reservation{font-size:8px;color:#0066cc;margin:2px 0;text-align:left;display:block;}
          @media print{@page{size:A4 landscape;margin:1cm;}}
        </style>
      </head><body>
        <h1>${selectedYear}년 ${selectedMonth}월 현황</h1>
        <h2>< ${selectedRoom} ></h2>
        <table>
          <thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead>
          <tbody>
            ${weeksData.map(week => `<tr>${week.map(day => `<td>${day ? `<div class="day-number">${day}</div>${getReservationsForDayPDF(day).map(res => `<div class="reservation">${res}</div>`).join('')}` : ''}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <script>window.onload=function(){window.print();}</script>
      </body></html>`);
     printWindow.document.close();
   };

  const toggleMenu = (menu) => { setExpandedMenus(prev => ({...prev, [menu]: !prev[menu]})); };

  const handleRoomCat1Change = (e) => {
    const value = e.target.value;
    setRoomCat1(value); setRoomCat2(''); setRoomCat3(''); setSelectedRoomForm('');
  };
  const handleRoomCat2Change = (e) => {
    const value = e.target.value;
    setRoomCat2(value); setRoomCat3(''); setSelectedRoomForm('');
    if (roomCat1 === '가무연습실' && value) { setSelectedRoomForm(value); }
    else if (value === '학생라운지스터디룸' && roomCat3Options[value]?.length === 1) {
       setRoomCat3(roomCat3Options[value][0]); setSelectedRoomForm(roomCat3Options[value][0]);
    }
  };
  const handleRoomCat3Change = (e) => {
    const value = e.target.value;
    setRoomCat3(value); setSelectedRoomForm(value);
  };

  const handleNew = () => {
    const today = new Date();
    setApplicationDate(formatDate(today));
    setIsFormDisabled(false); setSelectedReservationId(null);
    setDept1(''); setStatus1(''); setDept2(''); setStatus2('');
    setHvacCheckDept(''); setHvacStatus('');
    setRoomCat1(''); setRoomCat2(''); setRoomCat3(''); setSelectedRoomForm('');
    setReservationDate(''); setStartTime(''); setEndTime('');
    setOrgName(''); setOrgMiddleCat(''); setOrgDetail(''); setFinalOrgName('');
    setContact(''); setEmailLocal(''); setEmailDomain('직접입력');
    setEventTitle(''); setEventHeadcount(''); setHvacUsage('미사용'); setRentalItems('');
    setCheckedTerms1(false); setCheckedTerms2(false); setCheckedTerms3(false);
    setCheckedTerms4(false); setCheckedTerms5(false);
    setPickerDate(today);
  };

  const handleRowClick = (reservation) => {
    setSelectedReservationId(reservation.id);
    setIsFormDisabled(true);
    setApplicationDate(reservation.date);
    setDept1(reservation.dept1); setStatus1(reservation.status1);
    setDept2(reservation.dept2); setStatus2(reservation.status2);
    setHvacCheckDept(reservation.hvacCheckDept); setHvacStatus(reservation.hvacStatus);
    setRoomCat1(reservation.roomCat1 || '');
    setRoomCat2(reservation.roomCat2 || '');
    setRoomCat3(reservation.roomCat3 || '');
    setSelectedRoomForm(reservation.room);
    setReservationDate(reservation.eventDate);
    setStartTime(reservation.time); setEndTime(reservation.endTime);
    setOrgName(reservation.orgName); setOrgMiddleCat(reservation.orgMiddleCat);
    setOrgDetail(reservation.orgDetail); setFinalOrgName(reservation.facility);
    setContact(reservation.contact); setEmailLocal(reservation.emailLocal);
    setEmailDomain(reservation.emailDomain);
    setEventTitle(reservation.instructor); setEventHeadcount(reservation.eventHeadcount);
    setHvacUsage(reservation.hvacUsage); setRentalItems(reservation.rentalItems);
    setCheckedTerms1(false); setCheckedTerms2(false); setCheckedTerms3(false);
    setCheckedTerms4(false); setCheckedTerms5(false);
  };

  // --- [MODIFIED] 상단 '신청취소' 버튼 핸들러 (cancelReservation 사용) ---
  const handleCancelApplication = () => {
    if (!selectedReservationId) {
      setAlertMessage('취소할 항목을 목록에서 선택해주세요.');
      return;
    }
    const reservationToCancel = reservations.find(res => res.id === selectedReservationId);
    if (reservationToCancel && reservationToCancel.status === '신청중') {
      cancelReservation(selectedReservationId); // Context 함수 사용
      handleNew();
      setAlertMessage('정상적으로 취소되었습니다.'); // 기존 메시지 유지
    } else if (reservationToCancel && reservationToCancel.status === '승인') {
      setAlertMessage('이미 승인된 예약은 취소할 수 없습니다.\n확인부서에 문의해주세요.');
    }
     else {
      setAlertMessage('취소할 수 없는 상태이거나 항목을 찾을 수 없습니다.');
    }
  };

  const handleCheckAllTerms = () => {
    setCheckedTerms1(true); setCheckedTerms2(true); setCheckedTerms3(true);
    setCheckedTerms4(true); setCheckedTerms5(true);
  };

  // --- [MODIFIED] handleSubmit (addReservation 사용, id/no 제거) ---
  const handleSubmit = () => {
    if (!selectedRoomForm) return setAlertMessage('행사장소를 최종 선택해주세요.');
    if (!reservationDate) return setAlertMessage('기간(날짜)을 선택해주세요.');
    if (!startTime || !endTime) return setAlertMessage('시작시간과 종료시간을 선택해주세요.');

    const todayParts = applicationDate.split('-').map(Number);
    const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    const reservationParts = reservationDate.split('-').map(Number);
    const reservationDay = new Date(reservationParts[0], reservationParts[1] - 1, reservationParts[2]);
    const diffTime = reservationDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      return setAlertMessage('예약은 사용 예정일로부터 최대 30일 전까지만 가능합니다.');
    }
    let businessDaysDiff = 0;
    let currentDate = new Date(today);
    while (currentDate < reservationDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (currentDate.getTime() === reservationDay.getTime()) { 
            break;
        }
        if (dayOfWeek > 0 && dayOfWeek < 6) {
            businessDaysDiff++;
        }
    }
    if (businessDaysDiff < 3) {
      return setAlertMessage('예약은 주말을 제외하고 최소 3일 전에 신청해야 합니다.\n(예: 금요일 예약 시 최소 화요일 신청)');
    }
    if (startTime >= endTime) return setAlertMessage('종료시간은 시작시간보다 늦어야 합니다.');
    
    // 시간 중복 검사 (Context의 reservations 사용)
    const conflictingReservations = reservations.filter(res =>
      res.room === selectedRoomForm && res.eventDate === reservationDate
    );
    for (const existingRes of conflictingReservations) {
      if (startTime < existingRes.endTime && endTime > existingRes.time) {
        return setAlertMessage(`선택하신 시간대 [${startTime}~${endTime}]는 신청이 불가합니다. \n 겹치는 예약 : [${existingRes.time}~${existingRes.endTime}] ${existingRes.instructor}(${existingRes.facility})`);
      }
    }
    
    if (!finalOrgName) return setAlertMessage('사용단체를 검색하여 입력해주세요.');
    if (!contact) return setAlertMessage('연락처를 입력해주세요.');
    if (!emailLocal) return setAlertMessage('이메일을 입력해주세요.');
    if (!eventTitle) return setAlertMessage('행사명을 입력해주세요.');
    if (!eventHeadcount || isNaN(parseInt(eventHeadcount)) || parseInt(eventHeadcount) <= 0) return setAlertMessage('행사인원을 정확히 입력해주세요.');
    if (!checkedTerms1 || !checkedTerms2 || !checkedTerms3 || !checkedTerms4 || !checkedTerms5) return setAlertMessage('예약자 확인사항을 모두 체크해주세요.');

    let determinedDept1 = '학생지원팀'; let determinedDept2 = '학생지원팀';
    if (roomCat1 === '스터디룸' && roomCat2 === '인문스터디룸') { determinedDept1 = '문과대학 행정실'; determinedDept2 = '문과대학 행정실'; }
    else if (roomCat1 === '스터디룸' && (roomCat2 === '해동스터디룸' || roomCat2 === '학생라운지스터디룸')) { determinedDept1 = '공과대학 행정실'; determinedDept2 = '공과대학 행정실'; }
    else if (roomCat1 === '체육시설' || roomCat1 === '가무연습실' || roomCat1 === '강의실') { determinedDept1 = '학생지원팀'; determinedDept2 = '학생지원팀'; }

    const determinedHvacDept = (hvacUsage === '냉방' || hvacUsage === '난방') ? '기관실' : '미신청';
    const determinedHvacStatus = (hvacUsage === '냉방' || hvacUsage === '난방') ? '미신청' : '미신청';

    setDept1(determinedDept1); setStatus1('미확인');
    setDept2(determinedDept2); setStatus2('미확인');
    setHvacCheckDept(determinedHvacDept); setHvacStatus(determinedHvacStatus);

    // [MODIFIED] id, no 필드 제거 (Context에서 생성)
    const newReservationData = {
      // id: Date.now(), // Context에서 처리
      // no: reservations.length + 1, // Context에서 처리
      date: applicationDate,
      facility: finalOrgName, instructor: eventTitle, room: selectedRoomForm,
      eventDate: reservationDate, time: startTime, endTime: endTime, status: '신청중',
      dept1: determinedDept1, status1: '미확인', dept2: determinedDept2, status2: '미확인',
      hvacCheckDept: determinedHvacDept, hvacStatus: determinedHvacStatus,
      roomCat1: roomCat1, roomCat2: roomCat2, roomCat3: roomCat3,
      orgName: orgName, orgMiddleCat: orgMiddleCat, orgDetail: orgDetail,
      contact: contact, emailLocal: emailLocal, emailDomain: emailDomain,
      eventHeadcount: eventHeadcount, hvacUsage: hvacUsage, rentalItems: rentalItems
    };

    addReservation(newReservationData); // Context 함수 사용
    setAlertMessage('정상적으로 신청되었습니다.'); // 기존 메시지 유지
  };

  const currentRoomCat2Options = roomCat2Options[roomCat1] || [];
  const currentRoomCat3Options = roomCat3Options[roomCat2] || [];

  const days = getCalendarDays(parseInt(selectedYear), parseInt(selectedMonth));
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const currentWeekDays = weeks[selectedWeek - 1] || [];

  useEffect(() => { handleNew(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3"> <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">INHA</span></div> <div> <h1 className="text-xl font-bold text-blue-800">인하대학교 학사행정</h1> <p className="text-xs text-gray-500">INHA UNIVERSITY</p> </div> </div> <button className="px-4 py-1 border border-gray-300 rounded text-sm">닫기</button>
      </header>

      <div className="flex">
        <aside className="w-60 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200"> <div className="flex items-center gap-3"> <div className="w-16 h-16 bg-gray-300 rounded-full"></div> <div> <div className="text-sm font-semibold">인공지능공학과</div> <div className="flex items-center gap-2"> <span className="text-sm">김건우 님</span> <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">ON</span> </div> </div> </div> </div>
          <nav className="py-2"> {Object.keys(expandedMenus).map(menu => ( <div key={menu}> <button onClick={() => toggleMenu(menu)} className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${ menu === '시설' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700' }`} > <span className="text-sm font-medium">{menu}</span> {expandedMenus[menu] ? <Minus size={16} /> : <Plus size={16} />} </button> {expandedMenus[menu] && menu === '시설' && ( <div className="bg-gray-50"> <button className="w-full px-8 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"> - 온라인 시설예약 </button> </div> )} </div> ))} </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="mb-6">
             <div className="flex items-center gap-2 text-sm text-gray-600 mb-3"> <span>홈</span> <ChevronRight size={14} /> <span>시설</span> <ChevronRight size={14} /> <span className="text-blue-600">온라인 시설예약</span> </div> <div className="flex items-center justify-between"> <div className="flex items-center gap-3"> <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"> <span className="text-white text-lg">📋</span> </div> <h2 className="text-2xl font-bold text-gray-800">온라인 시설예약</h2> </div> <div className="flex items-center gap-2"> <button className="px-4 py-2 bg-white border border-blue-600 text-blue-600 text-sm rounded">KOR</button> <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm rounded">ENG</button> </div> </div> <div className="text-right text-sm text-gray-600 mt-2"> 업무 문의 : 학생지원팀 032-860-7066 </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4"> <label className="flex items-center gap-2"> <input type="checkbox" className="rounded" /> <span className="text-sm">현 프로그램 담당여부 보기</span> </label> <label className="flex items-center gap-2"> <input type="checkbox" className="rounded" /> <span className="text-sm">사용연대 / 공지사항</span> </label> </div>
              <div className="flex items-center gap-2">
                <button onClick={handleNew} className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm rounded transform transition-transform active:bg-gray-200 active:scale-95">신규</button>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:bg-blue-300" disabled={isFormDisabled}>저장</button>
                <button onClick={handleCancelApplication} className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm rounded transform transition-transform active:bg-gray-200 active:scale-95">신청취소</button>
                <button className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm rounded transform transition-transform active:bg-gray-200 active:scale-95">도움말</button>
              </div>
            </div>
          </div>

          {/* Hydration 오류 방지를 위해 <tbody> 바로 안쪽의 주석 제거 */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-sm font-medium">신청일</th>
                  <th className="px-4 py-3 text-sm font-medium">연번</th>
                  <th className="px-4 py-3 text-sm font-medium">사용단체</th>
                  <th className="px-4 py-3 text-sm font-medium">행사명</th>
                  <th className="px-4 py-3 text-sm font-medium">행사장소</th>
                  <th className="px-4 py-3 text-sm font-medium">사작일</th>
                  <th className="px-4 py-3 text-sm font-medium">시작시간</th>
                  <th className="px-4 py-3 text-sm font-medium">종료시간</th>
                  <th className="px-4 py-3 text-sm font-medium">상태</th>
                </tr>
              </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr
                      key={res.id}
                      onClick={() => handleRowClick(res)}
                      className={`border-b border-gray-200 cursor-pointer${
                        res.id === selectedReservationId ? ' bg-blue-100' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-center">{res.date}</td><td className="px-4 py-3 text-sm text-center">{res.no}</td><td className="px-4 py-3 text-sm text-center">{res.facility}</td><td className="px-4 py-3 text-sm text-center">{res.instructor}</td><td className="px-4 py-3 text-sm text-center">{res.room}</td><td className="px-4 py-3 text-sm text-center">{res.eventDate}</td><td className="px-4 py-3 text-sm text-center">{res.time}</td><td className="px-4 py-3 text-sm text-center">{res.endTime}</td><td className="px-4 py-3 text-sm text-center">{res.status}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>

          <div className="text-sm text-blue-600 mb-4"> 위의 신청자료를 Click하면 상세정보를 확인 할 수 있습니다. </div>

          {/* Hydration 오류 방지를 위해 <tbody> 바로 안쪽의 주석 제거 */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm w-48">신청일 / 확인 관련</td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4"> <span className="text-sm font-medium w-32">신청일</span> <span className="text-sm font-medium text-gray-700">{applicationDate}</span> <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded">사용확인서 인쇄</button> </div>
                      <div className="flex items-center gap-4"> <span className="text-sm w-32">1차확인부서</span> <input type="text" value={dept1} readOnly className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> <span className="text-sm w-16">확인여부</span> <input type="text" value={status1} readOnly className="w-24 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> </div>
                      <div className="flex items-center gap-4"> <span className="text-sm w-32">2차확인부서</span> <input type="text" value={dept2} readOnly className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> <span className="text-sm w-16">확인여부</span> <input type="text" value={status2} readOnly className="w-24 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> </div>
                      <div className="flex items-center gap-4"> <span className="text-sm w-32">냉/난방확인</span> <input type="text" value={hvacCheckDept} readOnly className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> <span className="text-sm w-16">확인여부</span> <input type="text" value={hvacStatus} readOnly className="w-24 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-500" /> </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm align-top">행사장소</td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm w-20 flex-shrink-0">행사장소</span>
                        <select value={roomCat1} onChange={handleRoomCat1Change} className={`border border-gray-300 rounded px-3 py-1 text-sm min-w-[150px] ${isFormDisabled ? 'bg-gray-100' : ''}`} disabled={isFormDisabled}> <option value="">대분류 선택</option> {roomCat1Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select>
                        {currentRoomCat2Options.length > 0 && ( <> <span>/</span> <select value={roomCat2} onChange={handleRoomCat2Change} className={`border border-gray-300 rounded px-3 py-1 text-sm min-w-[150px] ${isFormDisabled ? 'bg-gray-100' : ''}`} disabled={isFormDisabled || !roomCat1}> <option value="">중분류 선택</option> {currentRoomCat2Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> </> )}
                        {currentRoomCat3Options.length > 0 && roomCat1 !== '가무연습실' && roomCat2 !== '학생라운지스터디룸' && ( <> <span>/</span> <select value={roomCat3} onChange={handleRoomCat3Change} className={`border border-gray-300 rounded px-3 py-1 text-sm flex-1 min-w-[200px] ${isFormDisabled ? 'bg-gray-100' : ''}`} disabled={isFormDisabled || !roomCat2}> <option value="">소분류 선택</option> {currentRoomCat3Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> </> )}
                      </div>
                      <div className="flex justify-end mt-1"> <button className="px-3 py-1 bg-white border border-gray-300 text-sm rounded hover:bg-gray-50 disabled:bg-gray-100" onClick={() => setShowScheduleModal(true)} disabled={isFormDisabled}> 월별 시설이용현황 조회 </button> </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm">날짜</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 relative">
                      <span className="text-sm">기간</span> <span className="text-sm font-medium text-blue-600 w-24">{reservationDate || 'YYYY-MM-DD'}</span> <button type="button" onClick={() => setShowDatePicker(true)} className="p-1 border border-gray-300 rounded disabled:bg-gray-100" disabled={isFormDisabled}> <Calendar size={16} /> </button>
                      {showDatePicker && ( <DatePickerPopup selectedDate={reservationDate} pickerDate={pickerDate} setPickerDate={setPickerDate} onDateSelect={(dateStr) => { setReservationDate(dateStr); setShowDatePicker(false); }} onClose={() => setShowDatePicker(false)} getCalendarDays={getCalendarDays} /> )}
                      <span className="text-sm">시간</span> <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100' : ''}`} disabled={isFormDisabled}> <option value="">시작</option> {Array.from({ length: (22 - 7) * 6 }, (_, i) => { const hour = 7 + Math.floor(i / 6); const minute = (i % 6) * 10; return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`; }).map(time => <option key={time} value={time}>{time}</option>)} </select> <span>~</span> <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100' : ''}`} disabled={isFormDisabled}> <option value="">종료</option> {Array.from({ length: (23 - 7) * 6 }, (_, i) => { const hour = 7 + Math.floor(i / 6); const minute = (i % 6) * 10 + 9; return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`; }).map(time => <option key={time} value={time}>{time}</option>)} </select>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm align-top">사용단체</td>
                  <td className="px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"> <label className="text-sm font-medium w-20 flex-shrink-0">사용단체</label> <input type="text" className="w-1/4 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100" placeholder="단체구분" value={orgName} readOnly/> <input type="text" className="w-1/4 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100" placeholder="분과" value={orgMiddleCat} readOnly/> <span>/</span> <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100" placeholder="세부 단체명" value={orgDetail} readOnly/> <button onClick={() => setShowOrgSearchModal(true)} className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400" disabled={isFormDisabled}> 검색 </button> </div>
                      <div className="flex items-center gap-2"> <label className="text-sm font-medium w-20 flex-shrink-0">단체명</label> <input type="text" value={finalOrgName} readOnly placeholder="단체명은 사용단체 검색을 통해 입력하세요." className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm bg-gray-100 text-gray-700"/> </div>
                      <p className="text-xs text-blue-600">※ 소모임인 경우에 예약후, 사용날짜 1일전까지 미승인처리시 해당 단과대 행정실이나 학부, 학과에 승인요청 바랍니다.</p> <p className="text-xs text-red-600">※ 반드시 공식적인 단체명을 사용하시기 바랍니다.</p>
                      <div className="flex items-center gap-2 pt-2"> <label className="text-sm font-medium w-20 flex-shrink-0">연락처</label> <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm w-48 ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled} /> </div>
                      <div className="flex items-center gap-2"> <label className="text-sm font-medium w-20 flex-shrink-0">이메일</label> <div className="flex items-center gap-2"> <input type="text" value={emailLocal} onChange={(e) => setEmailLocal(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm w-48 ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled} /> <span>@</span> <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled}> <option>직접입력</option> <option>naver.com</option> <option>gmail.com</option> <option>inha.ac.kr</option> </select> </div> </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm align-top">행사관련</td>
                  <td className="px-4 py-3">
                    <div className="space-y-3">
                      <div> <div className="text-sm font-medium mb-2">행사명</div> <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className={`w-full border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled} /> <p className="text-xs text-red-600 mt-1">※ 반드시 공식적인 행사명을 사용하시기 바랍니다.</p> </div>
                      <div> <div className="text-sm font-medium mb-2">행사인원</div> <div className="flex items-center gap-2"> <input type="number" value={eventHeadcount} onChange={(e) => setEventHeadcount(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm w-24 ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} min="1" disabled={isFormDisabled}/> <span className="text-sm">명</span> </div> </div>
                      <div> <div className="text-sm font-medium mb-2">냉/난방</div> <select value={hvacUsage} onChange={(e) => setHvacUsage(e.target.value)} className={`border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled}> <option>미사용</option> <option>냉방</option> <option>난방</option> </select> </div>
                      <div className="space-y-1 text-xs text-blue-600">
                        <p>※ 행사장 내 유선 리모컨으로도 사용 가능(공지사항 참고)</p>
                        <p>※ 사용자는 행사 종료 후 반드시 냉.난방 수동 OFF 실시</p>
                        <p>※ 냉.난방 미작동시 시설관리실(860-8340 + 안내 2번) 협조 요청</p>
                        <p>※ 방송기자재 사용시 최소 행사 3~4일 전 시설관리실에 사전 협의(860-8340 + 안내 4번)</p>
                        <p>※ 빔,마이크,앰프 등은 학생복지위원회(860-9135)로 직접 요청</p>
                        <p>※ 행사장 내 방송지원은 본 행사시에만 가능(리허설시 사전 지원 불가)</p>
                      </div>
                      <div> <div className="text-sm font-medium mb-2">대여물품 <span className="text-gray-500 text-xs">(방송기자재는 제외)</span></div> <input type="text" value={rentalItems} onChange={(e) => setRentalItems(e.target.value)} className={`w-full border border-gray-300 rounded px-3 py-1 text-sm ${isFormDisabled ? 'bg-gray-100 text-gray-500' : ''}`} disabled={isFormDisabled} />
                        <p className="text-xs text-blue-600 mt-1">※ 대여물품은 장소예약 완료후 사용확인서 출력하여 해당부서로 직접 요청해야 함.</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>대여가능물품 및 해당부서는 '장소별 예약안내 및 유의사항'에서 확인.</p>
                      </div>
                    </div>
                  </td>
                </tr>
                {/* --- 예약자 확인사항 --- */}
                <tr>
                  <td className="bg-blue-50 px-4 py-3 font-medium text-sm align-top">
                    예약자 확인사항
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-3">
                      <label className="flex items-start gap-2"> <input type="checkbox" checked={checkedTerms1} onChange={(e) => setCheckedTerms1(e.target.checked)} className="mt-1 flex-shrink-0" disabled={isFormDisabled} /> <span className="text-sm">"장소별 예약안내 및 유의사항"을 확인하였습니다. <button className="text-blue-600 underline disabled:text-gray-400" disabled={isFormDisabled}>상세보기</button></span> </label>
                      <label className="flex items-start gap-2"> <input type="checkbox" checked={checkedTerms2} onChange={(e) => setCheckedTerms2(e.target.checked)} className="mt-1 flex-shrink-0" disabled={isFormDisabled} /> <span className="text-sm">학교 주요행사 발생시 양보하겠습니다.</span> </label>
                      <label className="flex items-start gap-2"> <input type="checkbox" checked={checkedTerms3} onChange={(e) => setCheckedTerms3(e.target.checked)} className="mt-1 flex-shrink-0" disabled={isFormDisabled} /> <div className="text-sm"> <p>다음과 같은 행사의 경우 시설물을 예약할 수 없습니다.</p> <ul className="ml-4 mt-1 space-y-1 text-xs text-gray-600"> <li>- 요청내용과 실제 사용내용이 다른 경우(예: 행사내용, 사용단체 등)</li> <li>- 외부인 및 외부단체가 대다수 참여하는 경우</li> <li>- 시설물 훼손 가능성이 큰 경우</li> <li>- 화재 및 사고위험이 큰 경우</li> <li>- 정치적, 종교적 성향이 과도한 경우</li> <li>- 학생신분으로서 부적절한 경우</li> </ul> </div> </label>
                      <label className="flex items-start gap-2"> <input type="checkbox" checked={checkedTerms4} onChange={(e) => setCheckedTerms4(e.target.checked)} className="mt-1 flex-shrink-0" disabled={isFormDisabled} /> <span className="text-sm">운동장, 다목적구장, 농구장등 기타외부장소를 이용하는 사용자의 경우 해당 시설에서 수업 진행시 수업에 방해되는 행동과 소음을 자제하여 주시기 바랍니다.</span> </label>
                      <label className="flex items-start gap-2"> <input type="checkbox" checked={checkedTerms5} onChange={(e) => setCheckedTerms5(e.target.checked)} className="mt-1 flex-shrink-0" disabled={isFormDisabled} /> <span className="text-sm">시설물 사용자 준수사항 (쓰레기수거 및 금연 등) 불이행 단체는 추후 기안시 취소 및 불이익을 받을 수 있습니다.</span> </label>
                      <div className="pt-2"> <button type="button" onClick={handleCheckAllTerms} className={`px-3 py-1 bg-gray-100 border border-gray-300 text-xs rounded hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transform transition-transform active:bg-gray-200 active:scale-95 ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isFormDisabled}> 모두 동의 </button> </div>
                      <div className="text-xs text-gray-600 space-y-1 mt-3">
                        <p>※ 60주년기념관 스터디라운지(총무팀(032-860-7097))를 제외한 시설물 기안에 대한 문의사항은 학생지원팀(032-860-7066)으로 문의하시기 바랍니다.</p>
                        <p>※ 인하-동하, 인하 튜터링 활동실 신청에 대한 문의사항은 교수학습개발센터(032-860-7026)로 문의하시기 바랍니다.</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transform transition-transform active:bg-blue-700 active:scale-95" disabled={isFormDisabled}>신청</button>
                        <button onClick={handleNew} className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transform transition-transform active:bg-gray-300 active:scale-95">취소</button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Hydration 오류 방지를 위해 <tbody> 바로 안쪽의 주석 제거 */}
      {showScheduleModal && ( <ScheduleModal onClose={() => setShowScheduleModal(false)} reservations={reservations} selectedYear={selectedYear} selectedMonth={selectedMonth} selectedRoom={selectedRoom} setSelectedYear={setSelectedYear} setSelectedMonth={setSelectedMonth} setSelectedRoom={setSelectedRoom} setSelectedWeek={setSelectedWeek} viewMode={viewMode} setViewMode={setViewMode} weeks={weeks} getCalendarDays={getCalendarDays} generatePDF={generatePDF} selectedWeek={selectedWeek} currentWeekDays={currentWeekDays} roomOptions={Object.values(roomCat3Options).flat().concat(roomCat2Options['가무연습실'])} /> )}
      {showOrgSearchModal && ( <OrgSearchModal onClose={() => setShowOrgSearchModal(false)} onConfirm={(name, middle, detail, finalName) => { setOrgName(name); setOrgMiddleCat(middle); setOrgDetail(detail); setFinalOrgName(finalName); setShowOrgSearchModal(false); }} /> )}

      {alertMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
           <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
             <h3 className={`text-lg font-bold mb-4 ${alertMessage.includes('신청되었습니다.') || alertMessage.includes('취소되었습니다.') ? 'text-blue-600' : 'text-red-600'}`}>알림</h3>
             <div className="text-sm mb-6"> {alertMessage.split('\n').map((line, index) => (<p key={index}>{line}</p>))} </div>
             <div className="text-right"> <button onClick={() => setAlertMessage('')} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">확인</button> </div>
           </div>
        </div>
      )}
    </div>
  );
}

// --- Separate Components for Modals ---
function ScheduleModal({ reservations, onClose, selectedYear, selectedMonth, selectedRoom, setSelectedYear, setSelectedMonth, setSelectedRoom, setSelectedWeek, viewMode, setViewMode, weeks, getCalendarDays, generatePDF, selectedWeek, currentWeekDays, roomOptions }) {
  const filteredReservations = reservations.filter(res => {
    if (res.room !== selectedRoom) return false;
    const [resYear, resMonth] = res.eventDate.split('-').map(Number);
    return resYear === parseInt(selectedYear) && resMonth === parseInt(selectedMonth);
  });
  const checkWeeklyReservation = (day, hour, minuteSlot) => {
    if (!day) return false;
    const slotStartMinutes = hour * 60 + minuteSlot; const slotEndMinutes = slotStartMinutes + 9;
    for (const res of filteredReservations) {
      const resDay = parseInt(res.eventDate.split('-')[2], 10); if (resDay !== day) continue;
      const [startH, startM] = res.time.split(':').map(Number); const [endH, endM] = res.endTime.split(':').map(Number);
      const resStartMinutes = startH * 60 + startM; const resEndMinutes = endH * 60 + endM;
      if (slotStartMinutes <= resEndMinutes && slotEndMinutes >= resStartMinutes) return true;
    } return false;
  };
const getReservationsForDayFiltered = (day) => {
     if (!day) return [];
     return filteredReservations
       .filter(res => parseInt(res.eventDate.split('-')[2], 10) === day)
       .sort((a, b) => a.time.localeCompare(b.time))
       .map(res => {
         const displayEndTime = ['09', '19', '29', '39', '49', '59'].includes(res.endTime.substring(3, 5))
            ? res.endTime
            : res.endTime;
         return `[${res.time}~${displayEndTime}] _${res.instructor}(${res.facility})`;
       });
   };
 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-6xl max-h-[90vh] overflow-hidden"> <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center"> <h2 className="text-lg font-bold">주요시설 이용현황 조회</h2> <button onClick={onClose} className="px-4 py-1 border border-white rounded text-sm hover:bg-gray-700"> 닫기 </button> </div> <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"> <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"> <div className="flex items-center gap-4 flex-wrap"> <span className="font-medium text-blue-800">월별 이용현황</span> <select value={selectedYear} onChange={(e)=>{setSelectedYear(e.target.value); setSelectedWeek(1);}} className="border border-gray-300 rounded px-3 py-1 text-sm"> <option>2025</option> <option>2026</option> </select> <span>년</span> <select value={selectedMonth} onChange={(e)=>{setSelectedMonth(e.target.value); setSelectedWeek(1);}} className="border border-gray-300 rounded px-3 py-1 text-sm"> {Array.from({length: 12}, (_, i) => i + 1).map(m=>(<option key={m} value={m}>{m}월</option>))} </select> <span>월</span> <select value={selectedRoom} onChange={(e)=>setSelectedRoom(e.target.value)} className="border border-gray-300 rounded px-3 py-1 text-sm w-96"> {roomOptions.map(room => <option key={room} value={room}>{room}</option>)} </select> <button className="px-4 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50" onClick={generatePDF}> 이용현황 인쇄 </button> </div> </div> <div className="flex gap-2 mb-4"> <button onClick={()=>setViewMode('month')} className={`px-4 py-2 rounded text-sm font-medium ${viewMode==='month'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}> 월별 보기 </button> <button onClick={()=>setViewMode('week')} className={`px-4 py-2 rounded text-sm font-medium ${viewMode==='week'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}> 주별 보기 </button> </div> {viewMode === 'week' && ( <WeekSelector weeks={weeks} selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek} /> )} <div className="text-center mb-4"> <h3 className="text-xl font-bold">{selectedYear}년 {selectedMonth}월 현황</h3> <p className="text-sm text-gray-600 mt-1">&lt; {selectedRoom} &gt;</p> </div> {viewMode === 'month' ? ( <MonthView weeks={weeks} getReservationsForDay={getReservationsForDayFiltered} /> ) : ( <WeekView currentWeekDays={currentWeekDays} selectedMonth={selectedMonth} checkReservation={checkWeeklyReservation} /> )} </div> </div> </div> );
}
function WeekSelector({ weeks, selectedWeek, setSelectedWeek }) {
  return ( <div className="flex items-center justify-center gap-1 mb-4 flex-wrap"> <button onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300" disabled={selectedWeek === 1}> ◀ </button> {weeks.map((week, idx) => { const startDay = week.find(d => d !== null); const endDay = week.filter(d => d !== null).pop(); if (!startDay) return null; return ( <button key={idx} onClick={() => setSelectedWeek(idx + 1)} className={`px-3 py-2 rounded text-xs font-medium ${selectedWeek === (idx + 1) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} > {idx + 1}주차 ({startDay}~{endDay}) </button> ) })} <button onClick={() => setSelectedWeek(prev => Math.min(weeks.length, prev + 1))} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300" disabled={selectedWeek === weeks.length}> ▶ </button> </div> );
}
function MonthView({ weeks, getReservationsForDay }) {
 return ( <div className="border border-gray-300 text-xs">
    <table className="w-full table-fixed">
      <thead>
        <tr className="bg-gray-100"> <th className="border border-gray-300 p-2">일</th><th className="border border-gray-300 p-2">월</th><th className="border border-gray-300 p-2">화</th><th className="border border-gray-300 p-2">수</th><th className="border border-gray-300 p-2">목</th><th className="border border-gray-300 p-2">금</th><th className="border border-gray-300 p-2">토</th> </tr>
      </thead>
      <tbody>
        {weeks.map((week, weekIdx) => ( <tr key={weekIdx}> {week.map((day, dayIdx) => ( <td key={dayIdx} className="border border-gray-300 p-2 align-top h-28"> <div className="h-full flex flex-col"> {day && ( <> <div className="font-bold mb-1 flex-shrink-0">{day}</div> <div className="overflow-y-auto flex-grow"> {getReservationsForDay(day).map((res, idx) => ( <div key={idx} className="text-[10px] text-blue-600 mb-1">{res}</div> ))} </div> </> )} </div> </td> ))} </tr> ))}
      </tbody>
    </table>
  </div> );
}
function WeekView({ currentWeekDays, selectedMonth, checkReservation }) {
 const hours = Array.from({ length: 21 - 7 + 1 }, (_, i) => 7 + i); // 7, 8, ..., 21
 return (
   <div className="border border-gray-300 text-xs overflow-x-auto">
     <table className="w-full min-w-[1200px] table-fixed">
       <thead>
         <tr className="bg-gray-100">
           <th className="border border-gray-300 p-2 w-24 sticky left-0 bg-gray-100 z-10">날짜</th>
           {hours.map(hour => (
             <th key={hour} className="border border-gray-300 p-2 min-w-[120px] w-[120px]">{hour}:00</th>
           ))}
         </tr>
       </thead>
       <tbody>
         {['일', '월', '화', '수', '목', '금', '토'].map((dayLabel, dayIdx) => {
           const day = currentWeekDays[dayIdx];
           return (
             <tr key={dayLabel}>
               <td className="border border-gray-300 p-2 text-center font-medium h-12 sticky left-0 bg-white z-10"> {dayLabel} <span className="block font-normal text-xs text-gray-600 mt-1">{day ? `${selectedMonth}/${day}` : ''}</span> </td>
               {hours.map(hour => (
                 <td key={`${day}-${hour}`} className="border border-gray-300 p-0 h-12 align-top">
                   {day && (
                     <div className="flex h-full">
                       {[0, 10, 20, 30, 40, 50].map(minute => {
                         const hasReservation = checkReservation(day, hour, minute);
                         return ( <div key={minute} title={`${day}일 ${hour}:${minute < 10 ? '0':''}${minute}`} className={`flex-1 border-r border-gray-200 last:border-r-0 ${hasReservation ? 'bg-blue-300' : 'bg-white'}`}> &nbsp; </div> );
                       })}
                     </div>
                   )}
                 </td>
               ))}
             </tr>
           );
         })}
       </tbody>
     </table>
   </div>
 );
}
function DatePickerPopup({ selectedDate, pickerDate, setPickerDate, onDateSelect, onClose, getCalendarDays }) {
 return ( <div className="absolute top-10 left-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-20 w-72"> <div className="flex items-center justify-between mb-3"> <button type="button" onClick={() => setPickerDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1 rounded hover:bg-gray-100"> <ChevronRight size={16} className="transform rotate-180" /> </button> <div className="font-bold text-sm">{pickerDate.getFullYear()}년 {pickerDate.getMonth() + 1}월</div> <button type="button" onClick={() => setPickerDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1 rounded hover:bg-gray-100"> <ChevronRight size={16} /> </button> </div>
     <table className="w-full text-xs text-center table-fixed">
       <thead>
         <tr> <th className="p-1 font-medium text-red-600">일</th><th className="p-1 font-medium">월</th><th className="p-1 font-medium">화</th><th className="p-1 font-medium">수</th><th className="p-1 font-medium">목</th><th className="p-1 font-medium">금</th><th className="p-1 font-medium text-blue-600">토</th> </tr>
       </thead>
       <tbody>
         {(() => { const pickerDays = getCalendarDays(pickerDate.getFullYear(), pickerDate.getMonth() + 1);
                 const pickerWeeks = []; for(let i=0; i<pickerDays.length; i+=7) pickerWeeks.push(pickerDays.slice(i, i+7)); return pickerWeeks.map((week, weekIdx) => ( <tr key={weekIdx}> {week.map((day, dayIdx) => { if (!day) return <td key={dayIdx}></td>; const y = pickerDate.getFullYear(); const m = pickerDate.getMonth(); const d = day; const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const isSelected = (selectedDate === dateStr); return (
                 <td key={dayIdx} className="p-1">
                   <button type="button" onClick={() => onDateSelect(dateStr)} className={`w-7 h-7 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} >
                     {day}
                   </button>
                 </td>
                 ) })} </tr> )); })()}
       </tbody>
     </table>
     <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200"> <button type="button" onClick={() => { const today=new Date(); const todayStr=formatDate(today); onDateSelect(todayStr); }} className="text-xs text-blue-600 hover:underline"> 오늘 </button> <button type="button" onClick={onClose} className="text-xs text-gray-600 hover:underline"> 닫기 </button> </div>
   </div>
 );
}
// --- [FIXED] Org Search Modal (Full Options + Typo Fix) ---
function OrgSearchModal({ onClose, onConfirm }) {
  const [cat1, setCat1] = useState('');
  const [cat2, setCat2] = useState('');
  const [cat3, setCat3] = useState('');
  const [manualName, setManualName] = useState('');

  const isManualInput = cat1 === '기타' || cat1.includes('소모임');

  const cat1Options = [
    '중앙동아리', '학생회(단과대/전공)', '학생자치기구', '소모임(단과대/전공)', '소모임(대학원)', '기타'
  ];

  const cat2Options = {
    '중앙동아리': ['공연', '어학', '연구', '사회', '종교', '전시', '무예', '구기', '레저', '봉사'],
    '학생회(단과대/전공)': ['공과대학', '자연과학대학', '경영대학', '사범대학', '사회과학대학', '문과대학', '의과대학', '예술체육대학', '미래융합대학', '바이오시스템융합학부', '소프트웨어융합대학', '간호대학', '프런티어창의대학', '국제학부'],
    '학생자치기구' : ['총학생회', '총대의원회', '동아리연합회', '기록물도서관', '중앙선거관리위원회'],
    '소모임(단과대/전공)': ['공과대학', '자연과학대학', '경영대학', '사범대학', '사회과학대학', '문과대학', '의과대학', '국제학부', '미래융합대학', '프런티어창의대학', '소프트웨어융합대학', '예술체육대학', '바이오시스템융합학부', '간호대학'],
    '소모임(대학원)' : ['일반대학원', '(특수)공학대학원', '(특수)경영대학원', '(특수)교육대학원', '(특수)정책대학원', '(특수)상담심리대학원', '(특수)보건대학원', '(특수)창의글로벌대학원', '(전문)법학전문대학원', '(전문)물류전문대학원', '(전문)제조혁신전문대학원'],
    '기타' : ['동문회', '교내 개인 모임', '학생사회봉사단 인하랑', '인하대학교 응원단(ASSESS)','중국인유학생회']
  };

  const cat3Options = {
    '공연': ['선택하세요', '개로', '고전기타회', '극단 봄', '꼬망스', '노래사랑', '인하오케스트라', '인다배소리', '인하극예술연구회', '인하인의 피아노 사랑', '인하합창단', '트리키', '판타스틱스테이션', '풍물사랑', 'F.L.EX.', 'FLAGON', 'INDKY', 'POP MUSIC', '인성'],
    '어학': ['선택하세요', '가이아', '알파카이','인하스피치','AIESEC in INHA', 'A.L.A', 'AZIT', 'Open Seasame', ' TIME 연구회'],
    '연구': ['선택하세요', '나래', '로보트연구회', '별지기', '보동보동', '산하사랑', '아이디어 뱅크', 'INCOM', '인하공방', '기우회', '인하로케트연구회', 'GDGoC', 'I.C.C', 'IBAS', 'UMC', '.NETers'],
    '사회': ['선택하세요', '독서 삼매경', '로맨스', '소네팅', '씨앗', '인액터스', '페다고지', 'TEDxInhaU'],
    '종교': ['선택하세요', '네비게이토', 'YWAM 예수전도단', '민족기독학생회', '인하대학교 불교학생회', '인하가톨릭학생회', '예수전도단', 'CAM', 'CCC', 'CFM 수화찬양동아리', 'ESF', 'IVF', 'JDM', 'JOY선교회','SFC'],
    '전시': ['선택하세요', '가스콘', '메이커', '양현재', '화우회', 'ADGON', '등대', '만화촌', '인하문학회', 'IMAGE', '샘 동인회' ],
    '무예': ['선택하세요', '검도부', '바크로바틱소울즈', 'COMBATE', '인하대학교 태권도부', '인하암즈', '인하유도회', 'IBF'],
    '구기': ['선택하세요', '라품', '러브올', '마농', 'TEN-X', '비룡', '셔틀콕', 'INHA-WICS', '인하 FC', '에이스리베로', 'Inha Teal Dragons(인하 미식축구부)', '테니스부'],
    '레저': ['선택하세요', '인하라이더', '이카루스', '탈라리아', 'SKIN-SCUBA', '인하대 조정부', '인하스키부', '산악부', '수영부', '스노우보드동아리', '블랙보드', '인하수중탐사반'],
    '봉사': ['선택하세요', '개구장이', '대우회/JOA', '로타랙트', '멍냥멍냥', '심성회', '아름회', '아해누리', '용마루', '인하브로드', '인하장학회', '트인', '파파(P.A.P.A', '하룡회', 'MRA', 'RCY'],
    '학생회_공과대학' : ['공과대학 학생회', '기계공학과 학생회', '항공우주공학과 학생회', '사회인프라공학과 학생회', '에너지자원공학과 학생회', '조선해양공학과 학생회', '산업경영공학과 학생회', '화학공학과 학생회', '고분자공학과 학생회', '환경공학과 학생회', '공간정보공학과 학생회', '건축공학과 학생회', '전기전자공학부 학생회', '신소재공학과 학생회', '반도체시스템공학과', '이차전지융합학과', '융합기술경영학부'],
    '학생회_자연과학대학' : ['자연과학대학 학생회','통계학과 학생회', '물리학과 학생회', '수학과 학생회', '화학과 학생회', '해양과학과 학생회', '식품영양학과 학생회'],
    '학생회_경영대학' : ['경영대학 학생회','경영학과 학생회', '파이낸스경영학과 학생회', '아태물류학부 학생회', '국제통상학과 학생회'],
    '학생회_사범대학' : ['사범대학 학생회','국어교육과 학생회', '영어교육과 학생회', '사회교육과 학생회', '교육학과 학생회', '체육교육과 학생회', '수학교육과 학생회'],
    '학생회_사회과학대학' : ['사회과학대학 학생회','행정학과 학생회', '정치외교학과 학생회', '미디어커뮤니케이션학과 학생회', '경제학과 학생회', '소비자학과 학생회', '아동심리학과 학생회', '사회복지학과 학생회'],
    '학생회_문과대학' : ['문과대학 학생회','일본언어문화학과 학생회', '문화콘텐츠문화경영학과 학생회', '사학과 학생회', '철학과 학생회', '한국어문학과 학생회', '중국학과 학생회', '영미유럽인문융합학부 학생회'],
    '학생회_의과대학' : ['의과대학 학생회', '의예과 학생회'],
    '학생회_예술체육대학' : ['예술체육대학 학생회','연극영화학과 학생회', '조형예술학과 학생회', '디자인융합학과 학생회', '스포츠과학과 학생회', '의류디자인학과 학생회'],
    '학생회_미래융합대학' : ['미래융합대학 학생회','산업경영학과 학생회', '소프트웨어융합공학과 학생회', '메카트로닉스공학과 학생회', '금융투자학과 학생회', '반도체산업융합학과 학생회'],
    '학생회_바이오시스템융합학부' : ['바이오시스템융합학부 학생회','생명공학과 학생회', '생명과학과 학생회', '첨단바이오의약학과 학생회'],
    '학생회_소프트웨어융합대학' : ['소프트웨어융합대학 학생회','인공지능공학과 학생회', '데이터사이언스학과 학생회', '스마트모빌리티공학과 학생회', '디자인테크놀로지학과 학생회','컴퓨터공학과 학생회'],
    '학생회_간호대학' : ['간호대학 학생회', '간호학과 학생회'],
    '학생회_프런티어창의대학' : ['자유전공융합학부', '공학융합학부', '자연과학융합학부', '경영융합학부', '사회과학융합학부', '인문융합학부'],
    '학생회_국제학부' : ['IBT학과', 'ISE 학과', 'KLC학과'],
    '소모임_공과대학' : ['공과대학 소모임','기계공학과 소모임', '항공우주공학과 소모임', '사회인프라공학과 소모임', '에너지자원공학과 소모임', '조선해양공학과 소모임', '산업경영공학과 소모임', '화학공학과 소모임', '고분자공학과 소모임', '환경공학과 학생회', '공간정보공학과 소모임', '건축공학과 소모임', '전기전자공학부 소모임', '신소재공학과 소모임','반도체시스템공학과 소모임', '이차전지융합학과 소모임', '융합기술경영학부 소모임'],
    '소모임_자연과학대학' : ['자연과학대학 소모임','통계학과 소모임', '물리학과 소모임', '수학과 소모임', '화학과 소모임', '해양과학과 소모임', '식품영양학과 소모임'],
    '소모임_경영대학' : ['경영대학 소모임','경영학과 소모임', '파이낸스경영학과 소모임', '아태물류학부 소모임' , '국제통상학과 소모임'],
    '소모임_사범대학' : ['사범대학 소모임', '국어교육과 소모임', '영어교육과 소모임', '사회교육과 소모임', '교육학과 소모임', '체육교육과 소모임', '수학교육과 소모임'],
    '소모임_사회과학대학' : ['사회과학대학 소모임','행정학과 소모임', '정치외교학과 소모임', '미디어커뮤니케이션학과 소모임', '경제학과 소모임', '소비자학과 소모임', '아동심리학과 소모임', '사회복지학과 소모임'],
    '소모임_문과대학' : ['문과대학 소모임','일본언어문화학과 소모임', '문화콘텐츠문화경영학과 소모임', '사학과 소모임', '철학과 소모임', '한국어문학과 소모임', '중국학과 소모임', '영미유럽인문융합학부 소모임'],
    '소모임_의과대학' : ['의과대학 소모임','의예과 소모임'],
    '소모임_예술체육대학' : ['예술체육대학 소모임','연극영화학과 소모임', '조형예술학과 소모임', '디자인융합학과 소모임', '스포츠과학과 소모임', '의류디자인학과 소모임'],
    '소모임_미래융합대학' : ['미래융합대학 소모임','산업경영학과 소모임', '소프트웨어융합공학과 소모임', '메카트로닉스공학과 소모임', '금융투자학과 소모임', '반도체산업융합학과 소모임'],
    '소모임_바이오시스템융합학부' : ['바이오시스템융합학부 소모임','생명공학과 소모임', '생명과학과 소모임', '첨단바이오의약학과 소모임'],
    '소모임_소프트웨어융합대학' : ['소프트웨어융합대학 소모임','인공지능공학과 소모임', '데이터사이언스학과 소모임', '스마트모빌리티공학과 소모임', '디자인테크놀로지학과 소모임','컴퓨터공학과 소모임'],
    '소모임_간호대학' : ['간호대학 소모임','간호학과 소모임'],
    '소모임_프런티어창의대학' : ['프런티어창의대학 소모임','자유전공융합학부 소모임', '공학융합학부 소모임', '자연과학융합학부 소모임', '경영융합학부 소모임', '사회과학융합학부 소모임' , '인문융합학부 소모임'],
    '소모임_국제학부' : ['IBT학과 소모임', 'ISE 학과 소모임', 'KLC학과 소모임'],
    '총학생회': [], '총대의원회' : [], '동아리연합회' : [], '기록물도서관' : [], '중앙선거관리위원회' : []
  };

  const currentCat2Options = cat2Options[cat1] || [];
  const handleCat1Change = (e) => { setCat1(e.target.value); setCat2(''); setCat3(''); setManualName(''); };
  const handleCat2Change = (e) => { const value = e.target.value; setCat2(value); setCat3(''); let tempCat3Key = ''; if (cat1 === '학생회(단과대/전공)') tempCat3Key = `학생회_${value}`; else if (cat1 === '소모임(단과대/전공)') tempCat3Key = `소모임_${value}`; else tempCat3Key = value; const tempCurrentCat3Options = cat3Options[tempCat3Key] || []; if (!isManualInput && tempCurrentCat3Options.length === 0 && value !== '선택하세요') { setManualName(value); } else if (!isManualInput) { setManualName(''); }};
  const handleCat3Change = (e) => { const value = e.target.value; setCat3(value); if (!isManualInput) { setManualName(value === '선택하세요' ? '' : value); }};
  let cat3Key = ''; if (cat1 === '학생회(단과대/전공)') cat3Key = `학생회_${cat2}`; else if (cat1 === '소모임(단과대/전공)') cat3Key = `소모임_${cat2}`; else cat3Key = cat2; const currentCat3Options = cat3Options[cat3Key] || [];
  const hasNoCat3 = cat1 && cat2 && cat2 !== '선택하세요' && currentCat3Options.length === 0; const hasCat3Dropdown = currentCat3Options.length > 0;
  const handleConfirm = () => {
    if (!cat1) return console.error('1차 분류를 선택하세요.');
    if (currentCat2Options.length > 0 && (!cat2 || cat2 === '선택하세요') && cat1 !== '기타' && !cat1.includes('소모임(대학원)')) return console.error('2차 분류를 선택하세요.');
    if (isManualInput) {
      if (!manualName) return console.error('단체명을 입력하세요.');
      if (cat1.includes('소모임')) {
        if (cat1 === '소모임(단과대/전공)' && (!cat3 || cat3 === '선택하세요')) return console.error('3차 분류(학과/소모임)를 선택하세요.');
        if (cat1 === '소모임(대학원)' && (!cat2 || cat2 === '선택하세요')) return console.error('2차 분류(대학원)를 선택하세요.');
        onConfirm(cat1, cat2, cat1 === '소모임(단과대/전공)' ? cat3 : '', manualName);
      } else { onConfirm(cat1, '', manualName, manualName); }
    } else if (hasNoCat3) { onConfirm(cat1, cat2, '', cat2);
    } else if (hasCat3Dropdown) { if (!cat3 || cat3 === '선택하세요') return console.error('3차 분류를 선택하세요.'); onConfirm(cat1, cat2, cat3, cat3);
    } else { console.error('단체를 선택하세요.'); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center"> <h2 className="text-lg font-bold">시설 사용단체 입력</h2> <div className="flex gap-2"> <button onClick={handleConfirm} className="px-4 py-1 bg-blue-600 border border-blue-400 rounded text-sm hover:bg-blue-700"> 확인 </button> <button onClick={onClose} className="px-4 py-1 bg-gray-600 border border-gray-500 rounded text-sm hover:bg-gray-700"> 닫기 </button> </div> </div>
        <div className="p-6"> <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"> <div className="flex items-center gap-2"> <label className="w-48 text-sm font-medium text-blue-800 flex-shrink-0">사용단체구분(대/중/소분류)</label> <select value={cat1} onChange={handleCat1Change} className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"> <option value="">선택하세요</option> {cat1Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> {currentCat2Options.length > 0 && ( <> <span>/</span> <select value={cat2} onChange={handleCat2Change} className="border border-gray-300 rounded px-3 py-1 text-sm flex-1"> <option value="">선택하세요</option> {currentCat2Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> </> )} { !hasNoCat3 && cat2 && cat2 !== '선택하세요' && (hasCat3Dropdown || (isManualInput && cat1 === '소모임(단과대/전공)')) && ( <> <span>/</span> <select value={cat3} onChange={handleCat3Change} className="border border-gray-300 rounded px-3 py-1 text-sm flex-1" disabled={!isManualInput && !hasCat3Dropdown} > <option value=""> {isManualInput && cat1 === '소모임(단과대/전공)' ? '학과 선택' : hasCat3Dropdown ? '선택하세요' : ''} </option> {currentCat3Options.map(opt => <option key={opt} value={opt}>{opt}</option>)} </select> </> )} </div> <div className="flex items-center gap-2 mt-3"> <label className="w-48 text-sm font-medium text-blue-800 flex-shrink-0">단체명</label> <input type="text" value={isManualInput ? manualName : (hasNoCat3 ? cat2 : (cat3 === '선택하세요' ? '' : cat3))} onChange={(e) => setManualName(e.target.value)} disabled={!isManualInput} placeholder={isManualInput ? "단체명을 직접 입력하세요." : "단체명은 사용단체 검색을 통해 입력하세요."} className={`flex-1 border border-gray-300 rounded px-3 py-1 text-sm ${!isManualInput ? 'bg-gray-100 text-gray-500' : 'bg-white'}`} /> </div> </div> </div>
      </div>
    </div>
  );
}