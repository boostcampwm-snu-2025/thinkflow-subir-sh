# thinkflow-lsh
아이디어(메모, 포스트) + 태스크(투두 리스트, 캘린더)를 한 번에 관리할 수 있는 생각 정리 앱 (w/ LLM)

## 데모
https://github.com/user-attachments/assets/00ba7836-5cf9-47ef-8d35-a7abfd85c3c7

(브라우저 캡처라 색 선택, 날짜 선택 등 추가 모달이 안 보이고 있습니다)

## 주요 기능 현황

### 구현 완료
- 아이템(메모/포스트/태스크) CRUD + UI
- 태그 CRUD 및 태그 기반 필터링 + UI
- 기본 페이지네이션, 정렬, 검색 기능
- 메모/포스트 → 태스크 승격 플로우
- 회고 포스트 생성 모달(LLM 초안 캐시/저장 플로우 포함 X)

### 예정/진행 중
- 댓글 CRUD
- 고급 정렬, 검색
- 캘린더 뷰 및 날짜 기반 인터랙션
- 타임라인 뷰
- 실제 LLM 연동

## 화면 플로우 개요
- **TaskPage**: 태스크 리스트, 생성/편집/삭제 모달, 완료 체크박스, 태그 필터링, 페이지네이션.
- **PostPage**: 메모/포스트 리스트, 헤더 검색/정렬, 빠른 메모 생성, 태그 관리, 태스크 승격, 회고 포스트 작성 모달.
- 상단 헤더 탭으로 TaskPage ↔ PostPage 전환.

## 유저 시나리오(핵심 흐름)
- **빠른 메모 작성**: 헤더 입력창에 내용을 작성 후 Enter 또는 + 버튼을 눌러 즉시 메모를 추가합니다.
- **아이디어를 태스크로 승격**: 메모/포스트 카드의 "태스크로 승격"을 클릭하면 태스크 생성 모달이 열리고, 기존 제목/내용/태그가 자동으로 채워집니다.
- **태스크 완료 및 회고**: 태스크 카드에서 완료 체크박스를 토글하면 완료 상태 UI로 전환되고, "회고 생성" 버튼으로 회고 포스트 생성 모달을 열 수 있습니다. 작성/저장 시 새로운 포스트로 기록됩니다.

## 기술 스택
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, TanStack Query, axios, clsx
- **Backend**: Express, TypeScript, Prisma, PostgreSQL
- **DevOps**: Docker Compose (FE/BE/DB 컨테이너), Swagger(백엔드 API 문서)

## 프로젝트 구조
```
./frontend   # React + Vite 클라이언트
./backend    # Express + Prisma API 서버
./shared     # FE/BE 공용 타입 및 유틸
```

## 로컬 실행 방법
1. `/backend/.env` 생성
   ```env
   DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mydb?schema=public"
   ```
2. 컨테이너 빌드
   ```bash
   docker compose build --no-cache
   ```
3. 컨테이너 실행
   ```bash
   docker compose up -d
   ```
4. Prisma 마이그레이션 적용
   ```bash
   docker compose exec backend npx prisma generate
   docker compose exec backend npx prisma migrate dev
   ```
5. 기본 사용자 추가
   ```bash
   docker compose exec postgres bash
   psql -U postgres -d mydb
   INSERT INTO "User" (email, name) VALUES ('test@example.com', 'Default User');
   ```
이후에는 docker compose up -d 및 docker compose down으로 온오프 가능

- FE: http://localhost:5173
- BE: http://localhost:3000 (Swagger: http://localhost:3000/api-docs)

## MVP 구현 이후 구체적인 투두 리스트
- 댓글, LLM 연동, 캘린더, 타임라인 등 확장 기능
- BE: 에러 처리를 Service로 이동
- BE: User, Auth 미들웨어 추가?
- BE: (구현하고 싶다면) 유저 별 아이템 페이지네이션 API 제공
- BE: tags.routes.ts에서 태그를 아이템에 추가하는 로직 items.routes.ts로 이전
- BE: 모든 API에 @openapi 추가하기 (Swagger)
- FE: 기한, 우선 순위, 상태 별 정렬/필터링
- FE: 캘린더 도입 시 RepeatRule 추가
- FE: 한 아이템이 수정될 때마다 전체 아이템 refetch되는 것 방지하기 (Tanstack query의 invalidateQueries -> setQueryData ?)
- FE: TaskCard clsx의 하드 코딩 제거
- FE: 태그 수정/삭제 시 리스트 아이템에 즉각 반영 안됨 (새로고침 시 반영)
- FE: 태그 호버링 UI가 다른 태그 뒤에 나타남
- FE: 리팩토링!!! -> 엄청나게 많은 State들 더 깔끔하게 관리...
