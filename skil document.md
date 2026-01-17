## 1. 프론트엔드 기술 정의

### 1) 기술 스택

- **React.js**
    - 컴포넌트 기반, 빠른 화면 업데이트
- **CSS 프레임워크**
    - Material-UI 또는 TailwindCSS (반응형, 현대적 UI 구성)
- **상태 관리**
    - React Context, 상황에 따라 Redux
- **라우팅**
    - react-router-dom (SPA 구현)
- **이미지 업로드 지원**
    - 외부 스토리지 API 연동(Cloudinary, Firebase Storage 등)
- **데이터 시각화**
    - Chart.js(간단 통계 그래프 구현)
- **API 통신**
    - Axios, Fetch(REST API 호출)


### 2) 핵심 화면 컴포넌트

- 만화책 리스트/등록/상세/검색/통계 각 컴포넌트
- 등장인물 입력 및 순위(Drag \& Drop) UI
- 이미지 업로드 UI
- 사용자 친화적 폼 컴포넌트(Validation, 인풋 등)


## 2. 백엔드 기술 정의

### 1) 기술 스택

- **Node.js + Express**
    - RESTful API 서버, 비동기 처리 강점
- **데이터베이스**
    - **MongoDB Atlas**
        - 클라우드 기반, 스키마 유연, 무료 플랜 제공
        - mongoose ODM 사용 권장
    - 또는 **Firebase Firestore**
        - NoSQL 구조, 빠른 구축, 프론트와 쉽게 연동
- **API 설계**
    - CRUD 엔드포인트 (만화/소감/등장인물별)
    - 예시)
        - `GET /comics`, `POST /comics`
        - `GET /comics/:id`, `PUT /comics/:id`, `DELETE /comics/:id`
        - `POST /comics/:id/characters` 등


### 2) 주요 비기능 요건

- 인증 및 권한 관리 없음 (오픈 데이터/테스트 목적)
- CORS 허용 (프론트 별도 호스팅 시)
- 요청 데이터 밸리데이션 및 간단 오류 처리


## 3. API 기반 데이터 저장 서비스 제안

**(직접 서버 운영 대신 외부 API 백엔드 사용 옵션)**

- **Firebase Firestore**
    - 프론트엔드에서 직접 JS SDK 연동 → DB 연결, 서버 필요 없이 빠른 구축
    - 이미지 저장은 Firebase Storage 활용
    - 무료/소규모 프로젝트에 적합
- **Supabase**
    - 오픈소스 Postgres-기반 BaaS(Backend-as-a-Service)
    - 간단한 RESTful API, 실시간 지원, JS SDK 제공

## 4. 추가 가이드

- 개발 초기에는 Firebase Firestore 또는 Supabase로 MVP를 구현하면 빠르고 운영이 편리함.
- 추후 확장(예: 사용자 기능 추가, 대규모 데이터)에 맞춰 커스텀 Node.js 백엔드+MongoDB로 전환 가능.
- 각 서비스 공식 문서와 무료 요금제 범위 참고.

**필요시 API 스키마 예시, 폴더 구조, 각 서비스 연동 예제 코드 등도 추가 안내해드릴 수 있습니다!**

