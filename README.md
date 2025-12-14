# thinkflow-lsh
아이디어(메모, 포스팅) + 태스크(투두 리스트, 캘린더)를 한 번에 관리할 수 있는 문서 정리 앱 (w/ LLM)

기술 스택: <br>
BE - Express, Prisma, PostgreSQL, TS <br>
FE - React, Vite, TS + TailwindCSS, Tanstack Query, axios, clsx, Zustand 

실행 방법:

1. /backend에 .env 생성 (내용: DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mydb?schema=public")

2. docker compose build --no-cache

3. docker compose up -d

(Prisma 스키마 생성)

4. docker compose exec backend npx prisma migrate dev

(임시 User 추가)

5. docker compose exec postgres bash

6. $ psql -U postgres -d mydb

7. $ INSERT INTO "User" (email, name) VALUES ('test@example.com', 'Default User');

이후에는 docker compose up -d / docker compose down으로 온오프 가능

FE -> localhost:5173

BE -> localhost:3000

(Swagger -> localhost:3000/api-docs)