# TODO

Module-by-module build checklist. Each module stops for approval before the next begins.

## 1. Project Structure ✅
- [x] Root docs (README, TODO, PROJECT_PROGRESS) + docker-compose.yml
- [x] Backend: Maven skeleton, package layout, CorsConfig/OpenApiConfig, Dockerfile
- [x] Frontend: Next.js 16 + Tailwind v4 + shadcn/ui skeleton, route groups, providers, Dockerfile

## 2. Database Design ✅
- [x] ER diagram (`docs/ER_DIAGRAM.md`)
- [x] Flyway migration `V1__init_schema.sql` (companies, users, refresh_tokens, password_reset_tokens, tasks, comments, attachments, notifications)

## 3. Backend APIs ✅
- [x] JPA entities for all 8 tables
- [x] Repositories (incl. Specification-based search for users/tasks)
- [x] DTOs (request/response) + mappers
- [x] Services + controllers for companies/users/tasks/comments/attachments/notifications
- [x] Global exception handling + validation

## 4. Authentication ✅
- [x] Register company (Owner)
- [x] Login / logout
- [x] JWT access + refresh token issuance and rotation
- [x] Forgot password / reset password / change password
- [x] Role-based authorization (OWNER/MANAGER/EMPLOYEE)

## 5. Frontend Layout
- [ ] Sidebar + top nav + profile menu
- [ ] Dark mode toggle
- [ ] Auth pages wired to backend (login/register/forgot password)
- [ ] Route protection (proxy.ts + client guards)
- [ ] Responsive layout, loading skeletons, toasts, confirmation dialogs

## 6. Dashboard (backend done, frontend pending)
- [x] Stat cards data (total/pending/in-progress/completed/overdue) — `GET /api/dashboard`
- [x] Recent activity feed data
- [x] Today's assigned tasks data
- [ ] Frontend page

## 7. Employee Management (backend done, frontend pending)
- [x] Add/edit/disable/delete employee API
- [x] Search employee API
- [x] Owner-only: create Manager rule
- [ ] Frontend page

## 8. Task Management (backend done, frontend pending)
- [x] Create/edit/delete/assign/reassign task API
- [x] Status + priority workflows
- [x] Comments + attachments (disk-backed, download endpoint)
- [x] Search & filters (task code/title, employee, priority, status, due date range)
- [ ] Frontend page + details drawer

## 9. Notifications (backend done, frontend pending)
- [x] Notification list/unread-count/mark-read/mark-all-read API
- [x] Triggers: task assigned/updated/completed, comment added
- [ ] Frontend bell + polling via React Query

## 10. Final Testing
- [ ] End-to-end smoke test of golden paths per role
- [ ] Edge cases (disabled employee, reassignment, overdue tasks)
