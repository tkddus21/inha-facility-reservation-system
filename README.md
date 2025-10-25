# inha-facility-reservation-system
인하대학교 시설 예약  통합 및 통합 관리 시스템 (FastAPI 기반 웹 애플리케이션)

# 인하대학교 시설 예약 시스템 (Inha Facility Reservation System)

본 프로젝트는 인하대학교 내의 시설(강의실, 회의실, 행사장 등)을 온라인으로 예약하고 관리할 수 있는 통합 플랫폼입니다.  
기존의 복잡한 오프라인/서류 기반 절차를 개선하여, **하나의 포털에서 예약·승인·이용현황 관리**가 가능하도록 설계되었습니다.

### ✨ 주요 기능
- 시설별 예약 가능 기간 및 승인 규칙 설정
- 월/주/3일 단위의 예약 현황 달력 보기
- 특정 시설의 예약 자동 승인 로직
- 오프라인 제출 서류의 온라인 사전 제출
- 강의실 대여 가능 여부 확인 및 자동 필터링
- 관리자 승인/조회 인터페이스

### ⚙️ 기술 스택
- **백엔드:** FastAPI (Python)
- **데이터베이스:** MySQL (SQLAlchemy ORM)
- **웹 서버:** Nginx
- **프런트엔드:** React (또는 Vue.js, 예정)
- **환경:** Docker 기반 로컬 개발 및 배포 지원


# Inha Facility Reservation System

A full-stack web application for managing and reserving university facilities at Inha University.  
This project modernizes the existing offline and fragmented reservation process by introducing an integrated online platform built with **FastAPI**, **MySQL**, and **Nginx**.

### ✨ Features
- Facility-specific reservation rules (e.g., booking period, approval types)
- Calendar-based reservation view (Month / Week / 3-day)
- Automatic approval logic for designated facilities
- Online document submission and management
- Admin panel for approval and usage history
- Modular backend architecture for future scalability

### 🏗️ Tech Stack
- **Frontend:** React (planned) / HTML, CSS, JS
- **Backend:** FastAPI (Python)
- **Database:** MySQL / SQLAlchemy ORM
- **Web Server:** Nginx
- **Containerization:** Docker (optional)
