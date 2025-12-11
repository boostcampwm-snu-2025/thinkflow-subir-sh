# thinkflow-lsh
아이디어(메모, 포스팅) + 태스크(투두 리스트, 캘린더)를 한 번에 관리할 수 있는 문서 정리 앱 (w/ LLM)

실행:

1. /backend에 .env 생성 (내용: DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mydb?schema=public")

2. docker compose build --no-cache

3. docker compose up -d

4. docker compose exec backend npx prisma migrate dev

이후에는 docker compose up -d / docker compose down으로 온오프 가능

FE -> localhost:5173

BE -> localhost:3000

(Swagger -> localhost:3000/api-docs)