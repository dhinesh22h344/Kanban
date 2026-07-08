# Flowdeck — Task Management System

A clean, simple, Jira-inspired task management app for small teams. Multi-tenant: each registered company (Owner) gets an isolated workspace for its Managers and Employees.

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, React Query, React Hook Form, Zod
- **Backend**: Java 21, Spring Boot 3.3, Spring Security + JWT, Spring Data JPA, MySQL, Flyway, Lombok
- **Infra**: Docker Compose (MySQL + backend + frontend)

## Local development

### Everything via Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui.html
- MySQL: localhost:3308 (user/pass: `kanban`/`kanban`, db: `kanban`)

### Backend only (hot reload via IDE/mvn)

```bash
# start just MySQL
docker compose up mysql -d

cd backend
JAVA_HOME=$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home \
  DB_PORT=3308 mvn spring-boot:run
```

Requires Java 21 (`brew install openjdk@21` if not already on PATH) and Maven.

### Frontend only

```bash
cd frontend
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install
npm run dev
```

## Project layout

```
Kanban/
├── backend/     Spring Boot API (Maven)
├── frontend/    Next.js app
├── docs/        ER diagram, architecture notes
├── docker-compose.yml
├── TODO.md
└── PROJECT_PROGRESS.md
```

## Build status

See [`PROJECT_PROGRESS.md`](./PROJECT_PROGRESS.md) for what's been built so far and [`TODO.md`](./TODO.md) for the module checklist.
# Kanban
