# Project Progress Log

## Module 1: Project Structure — done

**What was built:**
- Root: `README.md`, `TODO.md`, `PROJECT_PROGRESS.md`, `docker-compose.yml` (MySQL 8.4 on host port 3308, backend, frontend, named volumes for MySQL data + attachments).
- `backend/`: Java 21 + Spring Boot 3.3.5 Maven project (`com.kanban.taskmanager`). Layered package skeleton (`config`, `security`, `entity`, `repository`, `dto/{request,response}`, `service/impl`, `controller`, `exception`, `mapper`, `util`). Dependencies: Web, Security, Data JPA, Validation, Mail, MySQL connector, Flyway (+ flyway-mysql), Lombok, jjwt 0.12.6, springdoc-openapi 2.6.0. `CorsConfig` and `OpenApiConfig` in place; `application.yml` / `application-docker.yml` externalize DB, JWT, CORS, and attachment-storage settings via env vars. Multi-stage `Dockerfile`.
- `frontend/`: Next.js 16.2.10 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui (`base-nova` style). Route groups `(auth)` (login, register, forgot-password) and `(dashboard)` (dashboard, employees, tasks, settings) with placeholder pages. `Providers` wraps the tree with `next-themes`, React Query, `TooltipProvider`, and a `Toaster`. `proxy.ts` (Next 16 renamed `middleware.ts`) stubbed for future route protection. `lib/api/client.ts` holds a bare axios instance. Multi-stage `Dockerfile`.

**Decisions / deviations from the original plan:**
- Installed OpenJDK 21 via Homebrew (`brew install openjdk@21`) since only Java 17 was present system-wide; not symlinked into `/Library/Java/JavaVirtualMachines` (would need `sudo`), so backend builds must set `JAVA_HOME` explicitly (documented in README).
- Scaffolded on **Next.js 16 / Tailwind v4** instead of Next 14/Tailwind v3 — the latest `shadcn` CLI generates components for the new "base-nova" style, which requires Tailwind v4; rather than pin an old shadcn CLI version, moved the whole frontend to current-latest for a coherent, non-fighting toolchain.
- shadcn's own `form` registry component didn't resolve via the CLI (silently produced no file); hand-wrote `src/components/ui/form.tsx` following the same no-Radix, `base-nova`-style pattern as the other generated components (uses `React.cloneElement` instead of `@radix-ui/react-slot`, since this style has no Radix dependency).
- Renamed `middleware.ts` → `proxy.ts` per Next.js 16's file-convention rename (functionality unchanged).
- MySQL exposed on host port **3308** (not 3307) to avoid colliding with the unrelated ValgaaFS-BE project's MySQL container on this machine.
- Nested `.git` repos that `create-next-app` auto-initializes inside `frontend/` were removed both times, per the user's choice not to git-init yet (monorepo, single repo, initialized later by the user).

**Verified:**
- `docker compose config` parses cleanly.
- `cd backend && JAVA_HOME=<openjdk21> mvn -q compile` succeeds.
- `cd frontend && npm run build` and `npm run lint` succeed (one non-blocking unused-var warning in the `proxy.ts` stub, expected to be resolved when Module 5 fills in real logic).

---

## Module 2: Database Design — done

**What was built:**
- `docs/ER_DIAGRAM.md` — Mermaid ER diagram for all 8 tables.
- `backend/src/main/resources/db/migration/V1__init_schema.sql` — Flyway migration creating `companies`, `users`, `refresh_tokens`, `password_reset_tokens`, `tasks`, `comments`, `attachments`, `notifications`, with FKs and indexes on `company_id`, `email`, `status`, `assigned_to`, `task_code`.
- Verified by spinning up MySQL via `docker compose` and letting Spring Boot apply the migration on startup.

**Decisions:**
- Roles kept as a `VARCHAR` + `CHECK` enum column on `users` rather than a separate roles/permissions table — the 3 roles (OWNER/MANAGER/EMPLOYEE) are fixed, so a join table would be unused complexity for this app's scope.
- `task_code` is unique **per company** (not globally), generated as `TASK-<n>` via a per-company counter column on `companies` rather than a global auto-increment, so numbering starts at 1 for each new company.

**Next up:** Module 3 (Backend APIs) — JPA entities, repositories, DTOs, services, controllers for the schema above. Waiting for approval before starting.

---

## Modules 3, 4, 6 (backend), 7 (backend), 8 (backend), 9 (backend) — done

User chose to have the whole app built out end-to-end rather than stopping after every module, so the remaining backend work was built as one continuous pass (entities → security → auth → employees → tasks → notifications/dashboard), since splitting it further would have meant building throwaway auth stubs before real auth existed.

**What was built:**
- **Entities/enums**: `Company`, `User`, `RefreshToken`, `PasswordResetToken`, `Task`, `Comment`, `Attachment`, `Notification` + `Role`/`UserStatus`/`Priority`/`TaskStatus`/`NotificationType` enums, matching the Module 2 schema exactly (`ddl-auto: validate` confirms this on every boot).
- **Repositories**: standard Spring Data repos plus `JpaSpecificationExecutor` on `User`/`Task` for flexible multi-field search (`UserSpecifications`, `TaskSpecifications`), avoiding a combinatorial explosion of derived query methods.
- **Security**: `JwtService` (HMAC-signed access tokens carrying userId/companyId/role; opaque high-entropy refresh tokens stored server-side as SHA-256 hashes so they're revocable), `UserPrincipal`/`CustomUserDetailsService`/`JwtAuthFilter`, `SecurityConfig` (stateless, method security via `@PreAuthorize`, BCrypt).
- **Auth API** (`/api/auth`): register company+owner, login, refresh (rotates — old token is revoked on use), logout, forgot/reset password (generic response regardless of whether the email exists, to avoid user enumeration; reset token emailed via a best-effort `MailService` that logs and swallows failures if no SMTP server is configured), change password, `/me`.
- **Employee API** (`/api/employees`, Owner/Manager only): create/edit/disable/delete/search. Enforces "only Owner creates Managers," "Manager can only manage Employees," and blocks deleting an employee with task/comment/attachment history (they must be disabled instead) — hard-deleting would violate the FK constraints from Module 2 by design, since that history is meant to be preserved.
- **Task API** (`/api/tasks`): CRUD + assign/reassign (Owner/Manager only), status updates (any role, but Employees only on tasks assigned to them), search/filter (task code/title, assignee, priority, status, due-date range), nested comments and disk-backed attachments (upload/download). Employees are transparently scoped to their own assigned tasks everywhere (list, detail, comments, attachments) — they get a 403 if they try to touch anyone else's task.
- **Notifications**: write-side hooked directly into task/comment mutations (assigned, updated, completed, comment added — always to "the other party," never a self-notification); read-side is list/unread-count/mark-read/mark-all-read for polling.
- **Dashboard API** (`/api/dashboard`): stat cards + recent activity + today's-assigned-tasks, scoped to the whole company for Owner/Manager and to just their own tasks for Employees.

**Bugs found and fixed during the smoke test (below), not left in:**
- `/auth/me` threw `LazyInitializationException` — it mapped the `User` entity to a DTO *outside* a transaction (`open-in-view: false`, correctly disabled), so the lazy `Company` association had no session to initialize from. Fixed by moving the lookup+mapping into a new `@Transactional(readOnly = true) AuthService.getCurrentUser(...)`.
- `TaskService.search()` threw an NPE from `List.of(...)` — `List.of` rejects `null` elements, and several `TaskSpecifications` factory methods intentionally return `null` when a filter isn't supplied. `UserService`'s equivalent method already used `Arrays.asList` (which permits nulls); `TaskService` was inconsistent. Fixed to match.

**Verified end-to-end** against a real MySQL+Docker stack (not just `mvn compile`): registered a company/owner, logged in, created a Manager and an Employee, created and assigned a task, confirmed Employee-scoped task visibility and 403s on out-of-role actions (employee creating/deleting tasks, manager creating another manager), comment + status-update notifications landed on the right recipients, dashboard stats matched, attachment upload/download round-tripped file bytes correctly, refresh-token rotation invalidated the old token, disabling an employee blocked their login, and deleting an employee with task history correctly failed with a 400 telling the caller to disable instead.

**Next up:** Frontend — API client/auth context/route protection, then layout, dashboard, employee management, task management, and notifications pages, wiring up to the APIs above.
