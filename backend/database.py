from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# --- (중요) MySQL 연결 설정 ---
# DDL.sql 파일은 MySQL 기준이므로, MySQL에 연결합니다.

MYSQL_USER = "root" # 1. 본인의 MySQL 사용자 이름 (보통 root)
MYSQL_PASSWORD = "8475" # 2. ⚠⚠⚠ 이 부분을 본인의 MySQL 비밀번호로 변경하세요! ⚠⚠⚠
MYSQL_HOST = "127.0.0.1" # 로컬 호스트
MYSQL_DB = "inha_reserv" # Workbench에서 만든 DB 이름

# mysql+mysqlclient://{유저이름}:{비밀번호}@{서버주소}:{포트}/{DB이름}
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:3306/{MYSQL_DB}"

# (참고) 만약 'mysqlclient' 설치가 안돼서 'PyMySQL'을 설치했다면 아래 주석을 대신 사용하세요.
# SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:3306/{MYSQL_DB}"


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()