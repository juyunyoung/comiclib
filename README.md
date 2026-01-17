# ComicLib (코믹 라이브러리)

ComicLib은 사용자가 읽은 만화책을 기록하고, 간단한 소감과 등장인물 인기 순위를 매겨 저장하고 공유할 수 있는 나만의 만화 기록 일지 서비스입니다.

## 📁 프로젝트 구조

이 프로젝트는 두 개의 주요 컴포넌트로 구성되어 있습니다:

- **Frontend (`comiclib-app`)**: React 기반의 사용자 인터페이스
- **Backend (`comiclib-api`)**: Python Flask 기반의 API 서버 (AI 기능 및 검색 지원)

---

## 🚀 Frontend (`comiclib-app`)

사용자 인터페이스를 담당하는 웹 애플리케이션입니다.

### 🛠 사용 언어 및 라이브러리
- **Language**: JavaScript (React)
- **Framework & Build Tool**: Vite
- **UI Library**: Material-UI (@mui/material)
- **Backend/Auth**: Firebase (Authentication, Firestore, Storage)
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)
- **Routing**: React Router
- **Visualization**: Chart.js

### 🏃‍♂️ 실행 방법
터미널에서 `comiclib-app` 폴더로 이동 후 다음 명령어를 실행하세요.

```bash
# 폴더 이동
cd comiclib-app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:5173` (기본값)으로 접속할 수 있습니다.

---

## 🐍 Backend (`comiclib-api`)

AI 이미지 합성 및 검색 데이터 처리를 담당하는 백엔드 서버입니다.

### 🛠 사용 언어 및 라이브러리
- **Language**: Python
- **Framework**: Flask
- **AI/ML**: Google GenAI (Gemini)
- **Utilities**: Pydantic, Tenacity, Requests
- **Environment**: Python-dotenv

### 🏃‍♂️ 실행 방법
터미널에서 `comiclib-api` 폴더로 이동 후 가상환경을 설정하고 서버를 실행하세요.

```bash
# 폴더 이동
cd comiclib-api

# (선택) 가상환경 생성 및 활성화
python -m venv venv
# Mac/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행 (환경변수 설정 필요)
python app.py
```

> **Note**: 실행 전 `.env` 파일에 필요한 API 키(Gemini API Key 등)가 설정되어 있어야 합니다.

---

## 🐳 Docker 실행 방법

Docker를 사용하여 애플리케이션을 손쉽게 실행할 수 있습니다.

### 1. 한꺼번에 실행하기 (Docker Compose) - **권장**

`docker-compose`를 사용하면 Frontend와 Backend를 동시에 실행하고 자동으로 연결할 수 있습니다.

```bash
# 프로젝트 루트 경로에서 실행
docker-compose up --build
```

- **Frontend**: `http://localhost:8080`
- **Backend**: `http://localhost:5000`

### 2. 개별적으로 실행하기

#### Backend (`comiclib-api`)

```bash
cd comiclib-api
docker build -t comiclib-api .
docker run -d -p 5000:5000 --env-file .env --name comiclib-api comiclib-api
```

#### Frontend (`comiclib-app`)

Frontend는 API 서버와 통신해야 하므로, 동일한 네트워크에 있거나 호스트 네트워킹을 사용해야 할 수 있습니다.

```bash
cd comiclib-app
docker build -t comiclib-app .
docker run -d -p 8080:80 --name comiclib-app comiclib-app
```

> **Note**: 개별 실행 시에는 Frontend가 Backend를 찾지 못할 수 있으므로 **Docker Compose 사용을 권장**합니다.

---

## ✨ 주요 기능

1.  **만화책 등록**: 검색(Naver/Google) 또는 직접 입력을 통해 읽은 만화책 기록
2.  **소감 작성**: 짧은 서평과 좋았던 점/아쉬웠던 점 기록
3.  **캐릭터 랭킹**: 등장인물별 순위(1~5위) 및 코멘트 작성
4.  **AI 기능**:
    - **AI 합성**: 사용자의 사진과 만화 캐릭터를 합성하여 친구처럼 보이는 이미지 생성 (Gemini 활용)
    - **검색 강화**: AI를 활용한 도서 정보 검색 보조
5.  **통계 및 공유**: 내가 읽은 만화 통계 확인 및 기록 공유 기능
